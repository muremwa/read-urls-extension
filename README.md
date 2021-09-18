# Django Urls configurations Reader.
Reads all urls configurations declared in all Django projects within a VSCODE workspace and copy to clipboard.  

> ### ✨✨Introducing [settings](#settings 'new settings') for the extension ✨✨  
<br>

Gives the option of copying the url as __reverse__, __reverse_lazy__ or as a __template tag__ to your __clipboard__.  
Install from [here](https://marketplace.visualstudio.com/items?itemName=muremwa.read-urls).  
Jump to:  

• [Usage](#usage 'Usage of the extension').  
• [Custom Url configurations](#custom-url-configurations 'Custom URL conf').  
• [Creating Custom Url configurations](#creating-custom-configurations 'Creating custom conf').  
• [Using `ModelAdmin` urls](#modeladmin-urls 'ModelAdmin Urls').  
• [Multiple Django folders support](#multiple-projects-in-a-workspace 'Multiple folders').  

- - - 

## Usage.  
The extension adds a view on your side bar with the. Navigate to that view and click to open it and 
activate the extension.  

- - -
![acitvate extension](media/imgs/no_1.png 'What you\'ll see before activation')
- - -

Give it a few moments to read all urls and populate the view.   Once done it will populate the view with your urls.

Each app will be a collapsable tree with its urls as the children. App names are in __ALL CAPS__. If an app has no `app_name` it will be displayed in the following format `PARENT_FOLDER/URLS.PY`.  
A url may have children if it's arguments are defined.
If not the it's a single item.

- - -
![image explaining the project urls view](media/imgs/explanation.png 'Diffrent parts of the view')
- - -

## Actions.
On hovering over a url name, there are three buttons __(from left to right)__.  
1. Copy 'reverse' url.
2. Copy 'reverse_lazy' url.
3. Copy as a template tag.

All three copy to clipboard and can be pasted in your view or template.
- - -
  ![hover buttons](media/imgs/hovering_buttons.png 'hover over a url to expose available actions')
- - -


## Custom URL configurations.  
Sometimes you need 3rd party apps in your project which may have custom URL configurations. These configurations can be described in a JSON file named in the format; '`app.conf.json`'. These files are saved in '`.vscode/urlConfigs/`' folder in the root of your project to allow the extension to find them. They are combined with your project's configurations. To describe the URL configurations click [here](#creating-custom-configurations).  

>The extension comes pre-loaded with the `AdminSite`, `ModelAdmin` and `UserAdmin` configurations.
- - -

## Settings
The extension now has settings. They live inside `.vscode/urlConfigs/settings.json` inside in your project. They are on a project by project basis. If you have two projects in one workspace, each project shall have it's own sets of settings.  

Options for settings are explained below showing an example `.vscode/urlConfigs/settings.json` file;
```json
    {
        adminUrls: true,
        autoLoadModels: true,
        builtInAuth: false,
        expandApps: 'normal'
    }

```

1. `adminUrls` **[Boolean]**: `true` to show admin site urls configurations and `false` to not show.  
2. `autoLoadModels` **[Boolean]**: `true` to automatically discover models and `false` to use `.vscode/urlConfigs/models.json` (the traditional approach).  
3. `builtInAuth` **[Boolean]**: `true` to show url configurations from the built-in authentication sytem i.e. `django.contrib.auth.urls` or `false` to not.  
4. `expandApps` **[String]**: Collapse or expand the Apps to show urls. Choices are 3; `collapsed`, `expanded` or `normal`. normal is the default.
   

> `expandApps` requires a window reload to show changes


- - -
## Creating custom configurations.
The JSON file, named in the format described in the previous section, contains a list/array of Whole app configurations. i.e. Your whole project, no matter home many apps/urls.py there are, would be added to one `*.conf.json` file. Say there are three apps in your project, `api`, `store`, `billing`, they can be described in one file or a separate file for each.  
Custom configurations appear at the top and are collapsed by default.

Each app entry, in the array of apps, is an object with two properties: 
1. `appName` __[String]__: A string with the name of the app. _(Note this is not the usual `app_name` declared in the `urls.py`. It will just appear as the title in our URl configurations view)._


2. `urls` __[Array]__: An array of url configurations objects for that app. If no URL configurations leave as an empty array `[]`. A url configuration object is in the following format:
      1. `reverseName` __[String]__: This is the actual reverse name. If the app has an `app_name` and the name of the url is `index`, enter this as `app_name:index`. If no `app_name` enter as `index`.


      2. `arguments` __[Array]__: An array of a URL configuration parameters object. If there are no arguments leave this an empty array `[]`. These objects are in the format:
           1. `name` __[String]__: The name of the parameter as described in the `urls.py` file.
           2. `argType` __[String]__: The type of the parameter. Options are either: __string, slug, uuid, integer__.


      3. `viewName` __[String]__: The name of the view that handles that URL.


      4. `hasArgs` __[Boolean]__: `false` if `arguments` / entry 2 above is empty and vice versa.


To load changes click the reload button.

- - -
### Example in a `*.conf.json` file:
```JSON
[
    {
        "appName": "example",
        "urls": [
            {
                "reverseName": "url1",
                "arguments": [
                    {
                        "name": "name",
                        "argType": "string"
                    },
                    {
                        "name": "name_2",
                        "argType": "slug"
                    }
                ],
                "viewName": "views.example_1",
                "hasArgs": true
            },
            {
                "reverseName": "url2",
                "arguments": [],
                "viewName": "views.example_2",
                "hasArgs": false
            }
        ]
    },
    {
        "appName": "example_app_2",
        "urls": [
            {
                "reverseName": "url3",
                "arguments": [],
                "viewName": "views.example_3",
                "hasArgs": false
            }
        ]
    }
]
```

> Incase of incorrect configurations, the file is ignored.  
> [Check out the admin configurations file🧐.](extraUrls/admin.conf.json)

- - - 
## `ModelAdmin` URLs.
To use your admin models URL, add an object in `.vscode/urlConfigs/models.json` with properties as app_labels _(peak into `apps.py`)_ and a list of model names. 

To load changes click the reload button.

_Changes to detect models automatically are in development._
```JSON
    {
        "app_label": ["model1", "model2"],
        "app_label_2": ["model3"]
    }
```
- - -
## Multiple Projects in a workspace.
The extension now supports multiple projects in one workspace. Once you add a folder to the workspace, reload the window to view changes.  
![Multiple projects appear like this](media/imgs/multiple_projects.png 'Multiple projects appear like this')
- - -

## MISC
• Created by [Muremwa](https://github.com/muremwa/).  
• Copying to clipboard made possible by [clipboardy](https://github.com/sindresorhus/clipboardy).  
• Released under the [MIT License](LICENSE).
