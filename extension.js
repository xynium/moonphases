//Moon Phases
//V4

const Main = imports.ui.main;
const St = imports.gi.St;
const GObject = imports.gi.GObject;
const Gio = imports.gi.Gio;
const PanelMenu = imports.ui.panelMenu;
const PopupMenu = imports.ui.popupMenu;
const Me = imports.misc.extensionUtils.getCurrentExtension();
const Mainloop = imports.mainloop;
const Clutter = imports.gi.Clutter;
const Gtk = imports.gi.Gtk;
const ExtensionUtils = imports.misc.extensionUtils;
const calc = Me.imports.calc;
const Gettext = imports.gettext.domain('moonphases');
const _ = Gettext.gettext;

const _MS_PER_DAY = 1000 * 60 * 60 * 24;
const MTHMOON = 29.5;  // mois lunaire

let myPopup;
let label; 
let area 
let timeout;
let settings;
let isFresh;  //as data change once a day contain the day of data
//let old=0; // po debug 

const MyPopup = GObject.registerClass(
class MyPopup extends PanelMenu.Button {
    
    _init () {
        super._init(0);

        this.format_params = {
            hour: "2-digit",
            minute: "2-digit",
            timeZone: 'UTC',
            hour12: false
        }
    
        // Label  voir les style at https://docs.gtk.org/Pango/pango_markup.html
        label = new St.Label({style_class: 'moonphases-label',y_align: Clutter.ActorAlign.CENTER,text: _("HOLA!!!")});
        let topBox = new St.BoxLayout();
        topBox.add_actor(label);

        area = new St.DrawingArea({
            style_class : 'bg-color',
            reactive : true,
            can_focus : true,
            track_hover : true,
            style_class: 'moonphases-drawarea-dim'
        });
        topBox.add_actor(area)
       
        area.connect('repaint', this.onRepaint);
               
        this.add_actor(topBox);
        
        this.buildmenu();
    }

    buildmenu(){
        // Destroy previous box
        if (this.mainBox != null)
            this.mainBox.destroy();

        // Create main box
        this.mainBox = new St.BoxLayout();
        this.mainBox.set_vertical(true);

        // Create report box
        this.reportBox = new St.BoxLayout();
        this.reportBox.set_vertical(true);

        // Create report scrollview
        var scrollView = new St.ScrollView({style_class: 'vfade',
            hscrollbar_policy: Gtk.PolicyType.NEVER,
            vscrollbar_policy: Gtk.PolicyType.AUTOMATIC});
        scrollView.add_actor(this.reportBox);
        this.mainBox.add_actor(scrollView);

         let customButtonBox = new St.BoxLayout({
            style_class: 'moonphases-button-box ',
            vertical: false,
            clip_to_allocation: true,
            x_align: Clutter.ActorAlign.CENTER,
            y_align: Clutter.ActorAlign.CENTER,
            reactive: true,
            x_expand: true,
            pack_start: false
        });

        // custom round preferences button
        let prefsButton = this.createRoundButton('gnome-settings'); //preferences-system-symbolic', _("Preferences"));
        prefsButton.connect('clicked', () => {
            this.menu.actor.hide();
            ExtensionUtils.openPrefs(); 
            isFresh=0; // refresh will do 1 sec later with update
        });
        customButtonBox.add_actor(prefsButton);
        // now add the buttons 
        this.mainBox.add_actor(customButtonBox);

        this.menu.box.add(this.mainBox);
    }
    
    createRoundButton(iconName) {
        let button = new St.Button({
            style_class: 'moonphases-button-action' //'message-list-clear-button button moonphases-button-action'
        });
        button.child = new St.Icon({
            icon_name: iconName
        });
        return button;
    }
    
    onRepaint(area) {
        let cr = area.get_context();
        let RL=147,GL=90,BL=249; // color light
        let RD=80,GD=0,BD=0; //color dark

        cr.translate(area.width / 2, area.height / 2);
        cr.scale(area.width / 2, area.height / 2);

        let old=/*Math.floor*/((  new Date()-calc.NLDte) / _MS_PER_DAY);  // age de la lune
        //old+=0.6;
        while (old<0) old+=MTHMOON;
        while (old>MTHMOON) old-=MTHMOON;
        log ('depuis nouvelle lune '+old);

        let ALPHA=2*Math.PI*old/MTHMOON;
        let C=Math.cos(ALPHA);
        let S=Math.sign(Math.sin(ALPHA));
        
        let ALat=settings.get_double('latitude')*Math.PI/180.0
        if (settings.get_int('comblat')==1) ALat*=-1; 
        //ALat=0 ; //Math.PI/2;  //Debug
        let ARot=-ALat+Math.PI/2;
        if (S<0) ARot+=2*ALat;
        cr.rotate(ARot-Math.PI/2);

        cr.setSourceRGBA (RL/255, GL/255, BL/255, 1); 
        cr.arc(0.0, 0.0, 1.0 - 0.05, 0,  Math.PI);
        cr.fill();
        cr.setSourceRGBA(RD/255, GD/255, BD/255, 1);    // color dark
        cr.arcNegative(0.0, 0.0, 1.0 - 0.05, 0,  Math.PI);
        cr.fill();
        if (C<0) {
            cr.setSourceRGBA (RL/255, GL/255, BL/255, 1); 
        }
        cr.scale(1.0,Math.abs(C));
        cr.arc(0.0, 0.0, 1.0 - 0.05, 0, 2 * Math.PI);           
        cr.fill();

        cr.$dispose();
        return true;
    }
        
    updatemenu (AA,MM,JJ){
        calc.m_Lat=calc.Sexa2Dec(settings.get_double('latitude'));  //update la position
        if (settings.get_int('comblat')==1) calc.m_Lat=-calc.m_Lat;
        calc.m_Long=calc.Sexa2Dec(settings.get_double('longitude'));
        if (settings.get_int('comblon')==1) calc.m_Long=-calc.m_Long;
        calc.iAA=AA;calc.iMM=MM+1;calc.iJJ=JJ; //udate date month start 0
     
        this.reportBox.destroy_all_children();  //efface ancien
        let item = new PopupMenu.PopupMenuItem(calc.sunfunc());
        this.reportBox.add(item.actor);
       
        var separator = new PopupMenu.PopupSeparatorMenuItem();
        this.reportBox.add_actor(separator.actor);
       
        item = new PopupMenu.PopupMenuItem(calc.moonfunc());
        this.reportBox.add(item.actor);

        separator = new PopupMenu.PopupSeparatorMenuItem();
        this.reportBox.add_actor(separator.actor);
        
        item = new PopupMenu.PopupMenuItem(calc.moontabfunc());
        this.reportBox.add(item.actor);
    }    
});


function update() {
    let now = new Date();
    label.set_text(new Intl.DateTimeFormat("default",myPopup.format_params).format(now) + " UTC ");
    if (isFresh!=now.getUTCDate()){  // calc once a day
        myPopup.updatemenu(now.getUTCFullYear(),now.getUTCMonth(),now.getUTCDate());
        isFresh=now.getUTCDate();
        area.queue_repaint();
    }
    //area.queue_repaint(); // po debug
    return true;
}
  

function init() {
   ExtensionUtils.initTranslations('moonphases');   
}

function enable() {
  myPopup = new MyPopup();
  isFresh=0;
  settings = ExtensionUtils.getSettings('org.gnome.shell.extensions.moonphases');  //prefs.getSettings();
  Main.panel.addToStatusArea('myPopup', myPopup, 1,'center');
  timeout=Mainloop.timeout_add(1000, update );
}

function disable() {
  Mainloop.source_remove(timeout);
  calc.CleanVar();
  settings=null;
  label=null;
  sFresh=null;
  myPopup.destroy();
  myPopup = null;
}

