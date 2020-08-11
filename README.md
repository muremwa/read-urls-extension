# Django Urls configurations Reader.
Reads all urls configurations declared in a Django project.

Gives the option of copying the url as reverse, reverse_lazy or as a template tag.  
Install from [here](https://marketplace.visualstudio.com/items?itemName=muremwa.read-urls)

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
