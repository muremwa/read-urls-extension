# Change Log

## [0.0.1] - 2020-06-23
- Simple working version.  
  

## [1.0.0] - 2020-08-11
### Added
- Incoparated the changes from [Django-urls-reader](https://github.com/muremwa/django-url-reader).
- Simplfied the tree structure.
- Changed icons for light theme.
- Fixed a bug that caused the refresh icon to appear in places it's not meant.
  
## [1.0.1] - 2020-08-11
### Fixed
- Commented out urls are not shown.


## [1.1.0] - 2020-10-11
### Added
- You can now add custom URL configurations eg. for 3rd party apps.
- Added the admin site URL configurations.

## [1.1.1] - 2020-12-02

### Fixed
- Removed Admin URL configs when the project is not a Django one. [Issue here](https://github.com/muremwa/read-urls-extension/issues/3).
- Tooltips changed.
- `vscode.workspace.rootPath` is depracated, updated to `vscode.workspace.workspaceFolders`.

## [2.0.0] - 2021-04-19
### Added
- Added support for multiple projects in the workspace

## [2.0.1] - 2021-06-16
### Added
- Renamed from __django-urls-reader__ to __Django URLS Reader__.

## [2.1.0] - 2021-09-23
### Added
- Adds settings to the extension to customize behavior.
- Models in a project are now automatically detected by the extension.
- You can switch between using positional and keyword arguments in the *reverse*, *reverse_lazy* fucntions and the *url template tag*
- You can choose not to have admin URL configurations added automatically.
- Built-in auth/`django.contrib.auth` URL configurations are can be added like the admin URL configurations.
