/*jslint maxerr:1000 */
var _isAndroid = ( Ti.Platform.osname === 'android');
var _resourceDir = Ti.Filesystem.resourcesDirectory;

var polyfill = {
	startsWith : function(str,prefix){
		return str.slice(0, prefix.length) == prefix;		
	},
	endWith : function(str,suffix){
		str = str +'';
		var lastIndex = str.lastIndexOf(suffix);
    	return (lastIndex != -1) && (lastIndex + suffix.length == str.length);
	},
	iOSCopy : function(path,initalRoot,moveRoot){
		var loopElement,iLength,dirFiles, rootFile; 

  		//Create a root file object to get the meta info
  		rootFile = Ti.Filesystem.getFile(path);
				
		//Get all of the sub elements    
		dirFiles = rootFile.getDirectoryListing();		
		//Check that we have a valid directory
		if(dirFiles==null){			
			return;
		}
		
		var helpers = {
			 streamCopy : function(from,to){
				var sourceFile = Ti.Filesystem.getFile(from);
				var instream = sourceFile.open(Ti.Filesystem.MODE_READ);		
				var newFile = Ti.Filesystem.getFile(to);
				if(newFile.exists()){
					newFile.deleteFile();
				}
				var outstream = newFile.open(Ti.Filesystem.MODE_WRITE);
				var buffer = Ti.createBuffer({length: 1024});
				var size = 0;
				while ((size = instream.read(buffer)) > -1) {
				  outstream.write(buffer, 0, size);
				}
				
				// Cleanup.
				instream.close();
				outstream.close();
				sourceFile = null;
				newFile = null;	
			},
			copyFile : function(nativePath){
				var newPath = nativePath.replace(initalRoot,moveRoot);
				helpers.streamCopy(nativePath,newPath);						
			},			
			copyDir : function(nativePath){
				polyfill.iOSCopy(nativePath,initalRoot,moveRoot);
			},
			ensureDirectory : function(nativePath){
				var newDir = nativePath.replace(initalRoot,moveRoot);
				var destRoot = Ti.Filesystem.getFile(newDir);
				if(destRoot.exists()){
					destRoot.deleteDirectory();
				}
				destRoot.createDirectory();
				
				//Clean-up
				destRoot = null;				
			}			
		}
				
		//Make sure our copy to directory is in place
		helpers.ensureDirectory(path);
		
		//Get the length of the array outside of the loop to reduce speed issues
		var iLength = dirFiles.length;
		
		for (var iLoop=0;iLoop<iLength ;iLoop++){ 
			//Get our file element
		    loopElement = Ti.Filesystem.getFile(rootFile.nativePath, dirFiles[iLoop].toString());
			
	    	 //Hack to determine if this is a file or directory
	    	//Depending on your version of Ti we need to check if this exists				
			if(typeof loopElement.getDirectoryListing == 'function') {
				if ((loopElement.getDirectoryListing()==null)||(loopElement.getDirectoryListing()==undefined)){
			   		helpers.copyFile(loopElement.nativePath);						
				}else{
					helpers.copyDir(loopElement.nativePath);	
				}
			}else{
		   		helpers.copyFile(loopElement.nativePath);					
			}	

		   	
		   	loopElement = null;
		}
		
		//Clean-up our directory array
		dirFiles.length = 0;
		rootFile = null;		
	},
	androidFileCopy : function(path,initalRoot,moveRoot){
		var loopElement,iLength,dirFiles, rootFile; 
  
  		//Create a root file object to get the meta info
  		rootFile = Ti.Filesystem.getFile(path);
  		
		//Get all of the sub elements    
		dirFiles = rootFile.getDirectoryListing();
		
		//Check that we have a valid directory
		if(dirFiles==null){			
			return;
		}
		
		var helpers = {
			moveFile :function(nativePath){
				var newPath = nativePath.replace(initalRoot,moveRoot);
				var sourceFile = Ti.Filesystem.getFile(nativePath);
				var newFile = Ti.Filesystem.getFile(newPath);
				if(newFile.exists()){
					newFile.deleteFile();
				}
	
				sourceFile.copy(newFile.nativePath);
				sourceFile = null;
				newFile = null;
			},
			moveDir :function(nativePath){
		   		var newDir = nativePath.replace(initalRoot,moveRoot);
				var dirCheck = Ti.Filesystem.getFile(newDir);
				if(dirCheck.exists()){
					dirCheck.deleteDirectory();
				}
				dirCheck.createDirectory();
				dirCheck = null;
				polyfill.androidFileCopy(nativePath,initalRoot,moveRoot);
			}			
		};
				
		//Get the length of the array outside of the loop to reduce speed issues
		var iLength = dirFiles.length;
		
		for (var iLoop=0;iLoop<iLength ;iLoop++){ 
			//Get our file element
		    loopElement = Ti.Filesystem.getFile(rootFile.nativePath, dirFiles[iLoop].toString());
			
			//Android has some odd behavior that stops us from being able to determine
			//what is a directory and what is a file
			if(typeof loopElement.getDirectoryListing == 'function') {
				if ((loopElement.getDirectoryListing()==null)||
					(loopElement.getDirectoryListing()==undefined)||
					loopElement.getDirectoryListing().length ===0){
						
			   		helpers.moveFile(loopElement.nativePath);
			   								
				}else{
					helpers.moveDir(loopElement.nativePath);	
				}
			}else{
		   		helpers.moveFile(loopElement.nativePath);					
			}	
		   	
		   	loopElement = null;
		}
		
		//Clean-up
		dirFiles.length = 0;
		rootFile = null;
	}
};

var define ={
	directory : function(path){
		var loopElement,iLength,dirFiles, rootFile; 
		var descr = {
			name : null,
			nativePath : null,
			files : [],
			directories : []
		};
  
  		//Create a root file object to get the meta info
  		rootFile = Ti.Filesystem.getFile(path);
  		descr.name = rootFile.name;
  		descr.nativePath = rootFile.nativePath;
  		
		//Get all of the sub elements    
		dirFiles = rootFile.getDirectoryListing();
		
		//Clean up the root as it isn't needed anymore
		rootFile = null;
		
		//Check that we have a valid directory
		if(dirFiles==null){			
			return descr;
		}
		
		var helpers = {
			addFile : function(nativePath){
		   		var tempFile = define.file(nativePath);
		   		if(tempFile != null){
		   			descr.files.push(tempFile);
		   		}				
			},			
			addDir :function(nativePath){
		   		var tempDir = define.directory(nativePath);
		   		if(tempDir != null){
		   			descr.directories.push(tempDir);
		   		}				
			}			
		}

				
		//Get the length of the array outside of the loop to reduce speed issues
		var iLength = dirFiles.length;
		
		for (var iLoop=0;iLoop<iLength ;iLoop++){ 
			//Get our file element
		    loopElement = Ti.Filesystem.getFile(descr.nativePath, dirFiles[iLoop].toString());
			
			if(_isAndroid){
				//Android has some odd behavior that stops us from being able to determine
				//what is a directory and what is a file
				if(typeof loopElement.getDirectoryListing == 'function') {
					if ((loopElement.getDirectoryListing()==null)||
						(loopElement.getDirectoryListing()==undefined)||
						loopElement.getDirectoryListing().length ===0){
							
				   		helpers.addFile(loopElement.nativePath);
				   								
					}else{
						helpers.addDir(loopElement.nativePath);	
					}
				}else{
			   		helpers.addFile(loopElement.nativePath);					
				}	
			}else{
		    	 //Hack to determine if this is a file or directory
		    	//Depending on your version of Ti we need to check if this exists				
				if(typeof loopElement.getDirectoryListing == 'function') {
					if ((loopElement.getDirectoryListing()==null)||(loopElement.getDirectoryListing()==undefined)){
				   		helpers.addFile(loopElement.nativePath);						
					}else{
						helpers.addDir(loopElement.nativePath);	
					}
				}else{
			   		helpers.addFile(loopElement.nativePath);					
				}				
			}

		   	
		   	loopElement = null;
		}
		
		//Clean-up our directory array
		dirFiles.length = 0;
				
		return descr;
	},
	file : function(path){
		var descr = {
			name : null,
			nativePath : null,
			extension : null
		};

  		//Create a root file object to get the meta info
  		var rootFile = Ti.Filesystem.getFile(path);
  		descr.name = rootFile.name;
  		descr.nativePath = rootFile.nativePath;
  		descr.extension = rootFile.extension();
  		
  		rootFile = null;
  		
		return descr;		
	}	
};

exports.listContents = function(dirPath){
	return define.directory(dirPath);
};

exports.isInResourceDirectory = function(path){
	return polyfill.startsWith((path +''),_resourceDir);
};

exports.copy = function(oldDir,newDir){
	
	var source_directory = Ti.Filesystem.getFile(oldDir).nativePath;
	var dest = Ti.Filesystem.getFile(newDir);
	
	if(exports.isInResourceDirectory(dest.nativePath)){
		Ti.API.info("Target directory cannot be in your app resource folder");
		return;
	}
	
	if((dest.exists()) && (dest.readonly==false)){
		dest.deleteDirectory();
	}
	
	if(_isAndroid){
		polyfill.androidFileCopy(source_directory,source_directory,dest.nativePath);				
	}else{
		var destPath = (polyfill.endWith(dest.nativePath, Ti.Filesystem.separator) ? dest.nativePath : dest.nativePath + Ti.Filesystem.separator);		
		polyfill.iOSCopy(source_directory,source_directory,destPath);	
	}
	//Clean-up	
	source_directory = null;
	dest = null;		
};

exports.move = function(oldDir,newDir){
	var source_directory = Ti.Filesystem.getFile(oldDir);
	var dest = Ti.Filesystem.getFile(newDir);
	
	if(exports.isInResourceDirectory(dest.nativePath)){
		Ti.API.info("Target directory cannot be in your app resource folder");
		return;
	}
		
	sourceIsInResources = exports.isInResourceDirectory(dest.source_directory);
	
	if((dest.exists()) && (dest.readonly==false)){
		dest.deleteDirectory();
	}
	
	//Branch based on platform
	if(_isAndroid){
		//We
		polyfill.androidFileCopy(source_directory.nativePath,source_directory.nativePath,dest.nativePath);						
	}else{
		//If the source target is in the Resource directory
		//copy to avoid creating alias
		if(sourceIsInResources){
			exports.copy(oldDir,newDir);
		}else{
			source_directory.move(dest.nativePath);		
		}			
	}
	
	if((source_directory.exists()) && (source_directory.readonly==false) && (sourceIsInResources==false)){
		source_directory.deleteDirectory();
	}

	//Clean-up	
	source_directory = null;
	dest = null;		
};