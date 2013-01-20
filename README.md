
BenCoding.Dossier

Dossier allows you to move and copy folders in a cross-platform way.

<h2>How to install</h2>
Dossier is an CommonJS module making it straightforward to install.  Simply copy the dossier.js file into your project and require as needed.

<h2>How to use</h2>

The follow app.js snippet demonstrates how to use Dossier's copy and move methods.

The below snippet uses the SampleData directory also included in this repo.

<pre><code>

//Create our application namespace
var my = {};
//Import the module
my.dossier = require('dossier');

Ti.API.info('Copy one directory to another');

//Create our source and target directory paths
var sourceDir = Ti.Filesystem.getFile(Ti.Filesystem.resourcesDirectory, 'SampleData');
var targetDir = Ti.Filesystem.getFile(Ti.Filesystem.applicationDataDirectory + '/NewSampleData');

Ti.API.info('Copying ' + sourceDir.nativePath + ' to ' + targetDir.nativePath );
my.dossier.copy(sourceDir.nativePath,targetDir.nativePath);

Ti.API.info('List all the contents of ' + targetDir.nativePath);
var listTargetContents = my.dossier.listContents(targetDir.nativePath);

Ti.API.info('Move one directory to another');

Ti.API.info('Move ' + sourceDir.nativePath + ' to ' + targetDir.nativePath );
my.dossier.move(sourceDir.nativePath,targetDir.nativePath);

Ti.API.info('List all the contents of ' + targetDir.nativePath);
listTargetContents = my.dossier.listContents(targetDir.nativePath);
</code></pre>

<h2>Licensing & Support</h2>

This project is licensed under the OSI approved Apache Public License (version 2). For details please see the license associated with each project.

Developed by [Ben Bahrenburg](http://bahrenburgs.com) available on twitter [@benCoding](http://twitter.com/benCoding)

<h2>Learn More</h2>

<h3>Twitter</h3>

Please consider following the [@benCoding Twitter](http://www.twitter.com/benCoding) for updates 
and more about Titanium.

<h3>Blog</h3>

For module updates, Titanium tutorials and more please check out my blog at [benCoding.Com](http://benCoding.com).