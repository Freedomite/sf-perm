# sf-perm

use with permission sets only, if you are using profiles get with the times

fetches the permission set from the current default org and then strips out any custom fields the current repo is missing definitions for  

e.g. sf-perm -p 'force-app\main\default\permissionsets\Accounting.permissionset-meta.xml' 