'use strict';

var azbn = new require(__dirname + '/../../../../../../system/bootstrap')({
	
});

var app = azbn.loadApp(module);

var fs = require('fs');
var path = require('path');
var crypto = require('crypto');

var argv = require('optimist')
	.usage('Usage: $0 --action=[String of action] --path=[Path to root dir] --ext=[Fileext] --hash=[Type of hashes]')
	.default('path', './')
	.default('ext', '.php')
	.default('action', 'index')
	.default('hash', 'md5')
	//.demand(['str'])
	.argv
;


var getHash = function(str) {
	return crypto.createHash(argv.hash).update(str).digest('hex');
}


var storage_file = argv.path + '/' + argv.hash + '.signer.json';
var storage = {};

if(fs.existsSync(storage_file)) {
	
	storage = require(storage_file);
	
}


azbn.mdl('fs/tree').walk(argv.path, function(file, stat){
	
	if (stat && stat.isDirectory()) {
		
	} else if(stat) {
		
		if(path.basename(file).match(new RegExp(argv.ext + '$', 'ig'))) {
			
			var hash = fs.readFileSync(file, {encoding : 'utf8'});
			
			hash = getHash(hash);
			
			if(!storage[file]) {
				
				console.log('+++ New file: ', file);
				
				storage[file] = {
					ideal : hash,
					checkpoints : {},
				};
				
				storage[file].checkpoints[azbn.now()] = hash;
				
			} else if(argv.action == 'index') {
				
				storage[file].ideal = hash;
				storage[file].checkpoints[azbn.now()] = hash;
				
			} else {
				
				if(hash != storage[file].ideal) {
					console.log(file, ': sum is wrong');
				}
				
				storage[file].checkpoints[azbn.now()] = hash;
				
			}
			
		}
		
	}
	
}, function(err, results){
	
	fs.writeFileSync(storage_file, JSON.stringify(storage));
	
	/*
	switch(argv.action) {
		
		case 'check' : {
			
			
			
		}
		break;
		
		case 'index' : 
		default : {
			
			
			
		}
		break;
		
	}
	*/
	
});