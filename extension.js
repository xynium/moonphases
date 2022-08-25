//Moon Phases

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
const Lang = imports.lang;
const ExtensionUtils = imports.misc.extensionUtils;
const prefs = Me.imports.prefs;
const calc = Me.imports.calc;

let myPopup;
let label; 
let pmItem,timeout;
let settings;


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
    
        // Label
        label = new St.Label({y_align: Clutter.ActorAlign.CENTER,text: "HOLA!!!"});
        let topBox = new St.BoxLayout();
        topBox.add_actor(label);
               
        let icon = new St.Icon({ gicon : Gio.icon_new_for_string( Me.dir.get_path()+ '/moon.svg' ), style_class: 'moonphases-icon-size',   });
        topBox.add_actor(icon)
               
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

		// Separator
		//var separator = new PopupMenu.PopupSeparatorMenuItem();
		//this.mainBox.add_actor(separator.actor);
      
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
        let prefsButton = this._createRoundButton('preferences-system-symbolic', _("Preferences"));
        prefsButton.connect('clicked', Lang.bind(this, function(self) {
            this.menu.actor.hide();
            ExtensionUtils.openPrefs();
            
            
        }));
        customButtonBox.add_actor(prefsButton);
        // now add the buttons 
        this.mainBox.actor.add_actor(customButtonBox);

        this.menu.box.add(this.mainBox);
     
     
    }
    
     _createRoundButton(iconName) {
        let button = new St.Button({
            style_class: 'message-list-clear-button button moonphases-button-action'
        });

        button.child = new St.Icon({
            icon_name: iconName
        });

        return button;
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
    label.set_text(  new Intl.DateTimeFormat(  "default", myPopup.format_params    ).format(now) + " UTC " );
    myPopup.updatemenu(now.getUTCFullYear(),now.getUTCMonth(),now.getUTCDate());
    return true;
  }
  

function init() {
     // load correct menuItem depending on Gnome version
   /* if (ExtensionUtils.versionCheck(['3.36'], Config.PACKAGE_VERSION)) {
               MenuItem = Me.imports.menuItem;
    }*/
}

function enable() {
  myPopup = new MyPopup();
  settings = prefs.getSettings();
  Main.panel.addToStatusArea('myPopup', myPopup, 0);
  timeout=Mainloop.timeout_add(1000, update );
}

function disable() {
  Mainloop.source_remove(timeout);
  myPopup.destroy();
}

