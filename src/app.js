import "./stylesheets/main.css";

// ----------------------------------------------------------------------------

// ----------------------------------------------------------------------------

import { remote } from "electron";
import jetpack from "fs-jetpack";
import env from "env";

const app = remote.app;
const appDir = jetpack.cwd(app.getAppPath());
const Vue = require('vue/dist/vue.min.js');


// import 
// use an alias for my stuff
// import * as prs from "./prs/prs"




//sweet... so let's load the external JSON and data so 
//we can pass it around to the pure functions

const database = appDir.read("database.json", "json");
const main_dump = appDir.read("main_dump.json", "json");

//setup neDB so we can ditch the excell sheets 




//setup Vue :: controls the front-end

global.atom = new Vue({

	el:"#app",

	data:{

		raw:[],
		main:'',
		edits:[],

		screens:{

			'title':'title-screen',
			'runjob':'job-screen',
			'results':'result-screen',
			'editor':'edit-screen'
		}
	},

	created:function(){

		console.log('YO!');

		//console.log(database);

		this.$set(this,'main', database);

	},

	mounted:function(){

	},

	methods:{

		getProduct:function(id){

			//R.find in main

		},

		getProductFromRaw:function(){

			//R.find in raw

		}

	}

})


