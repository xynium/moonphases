// moon phases preferances
'use strict';
const {  Gio, Gtk ,GObject} = imports.gi;
const ExtensionUtils = imports.misc.extensionUtils;
const Me = ExtensionUtils.getCurrentExtension();
const Gettext = imports.gettext.domain('moonphases');
const _ = Gettext.gettext;

function init() {
    ExtensionUtils.initTranslations('moonphases');
}

function buildPrefsWidget () {
    let settings = ExtensionUtils.getSettings('org.gnome.shell.extensions.moonphases'); 
    let builder = new Gtk.Builder();
    builder.set_translation_domain('MoonPhases');
    builder.add_from_file(Me.path + '/prefs.ui');
          
    let widget0 = builder.get_object('elatitude');
    widget0.set_text(settings.get_double('latitude').toString());  //met le champ a jour avec le setting
    widget0.connect('changed', (widget0) => {    // connecte le champ po enregistrer les changement
        let text = widget0.get_text();
        if (!text) text = widget0.get_placeholder_text();
        settings.set_double('latitude', parseFloat(text));
        settings.set_boolean("torefresh", true);
     });
        
    let  widget1 = builder.get_object('elongitude');
    //  settings.bind('longitude', widget1, 'text', Gio.SettingsBindFlags.DEFAULT);
    widget1.set_text(settings.get_double('longitude').toString());
    widget1.connect('changed', (widget1) => {
        let text = widget1.get_text();
        if (!text) text = widget1.get_placeholder_text();
        settings.set_double('longitude', parseFloat(text));
        settings.set_boolean("torefresh", true);
    });

    let widget2 = builder.get_object('comblat');
    widget2.set_active(settings.get_int('comblat'));
    widget2.connect('changed', (widget2) => {
        settings.set_int('comblat', widget2.get_active());
        settings.set_boolean("torefresh", true);
    });;

    let widget3 = builder.get_object('comblon');
    widget3.set_active(settings.get_int('comblon'));
    widget3.connect('changed', (widget3) => {
        settings.set_int('comblon', widget3.get_active());
        settings.set_boolean("torefresh", true);
    });
      
    return builder.get_object('prefs-container') ;
}

