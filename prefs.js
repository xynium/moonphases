// moon phases preferances

const GObject = imports.gi.GObject;
const Gtk = imports.gi.Gtk;
const Me = imports.misc.extensionUtils.getCurrentExtension();
const Gio = imports.gi.Gio;
const Lang = imports.lang;

var wdjt1,wdjt2,wdjt3,wdjt4;

function init () {}

function buildPrefsWidget () {
  let widget = new MyPrefsWidget();
  widget.show_all();
  return widget;
}

function getSettings () {
  let GioSSS = Gio.SettingsSchemaSource;
  let schemaSource = GioSSS.new_from_directory(
    Me.dir.get_child("schemas").get_path(),
    GioSSS.get_default(),
    false
  );
  let schemaObj = schemaSource.lookup(
    'org.gnome.shell.extensions.moonphases', true);
  if (!schemaObj) {
    throw new Error('cannot find schemas');
  }
  return new Gio.Settings({ settings_schema : schemaObj });
}


const MyPrefsWidget = GObject.registerClass(
class MyPrefsWidget extends Gtk.ScrolledWindow {

  _init (params) {

    super._init(params);
    
    this._settings = getSettings();

    let builder = new Gtk.Builder();
    builder.set_translation_domain('MoonPhases');
    builder.add_from_file(Me.path + '/prefs.ui');
        
    let widget = builder.get_object('latitude');
    widget.set_text(this._settings.get_double('latitude').toString());  //met le champ a jour avec le setting
    wdjt1=widget.connect('changed', (widget) => {    // connecte le champ po enregistrer les changement
                let text = widget.get_text();
                if (!text) text = widget.get_placeholder_text();
                this._settings.set_double('latitude', parseFloat(text));
    });
    
    widget = builder.get_object('longitude');
    widget.set_text(this._settings.get_double('longitude').toString());
    wdjt2=widget.connect('changed', (widget) => {
        let text = widget.get_text();
                if (!text) text = widget.get_placeholder_text();
                this._settings.set_double('longitude', parseFloat(text));
    });
    
    widget = builder.get_object('comblat');
    widget.set_active(this._settings.get_int('comblat'));
    wdjt3=widget.connect('changed', (widget) => {
                this._settings.set_int('comblat', widget.get_active());
    });
         
    widget = builder.get_object('comblon');
    widget.set_active(this._settings.get_int('comblon'));
    wdjt4=widget.connect('changed', (widget) => {
                this._settings.set_int('comblon', widget.get_active());
    });
        
    this.add( builder.get_object('prefs-container') );
  }
});

