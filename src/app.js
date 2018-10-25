import "./stylesheets/main.css";
import "./stylesheets/bootstrap.min.css";

// ----------------------------------------------------------------------------

// ----------------------------------------------------------------------------

import { remote } from "electron";
import jetpack from "fs-jetpack";
import env from "env";

const app = remote.app;
const appDir = jetpack.cwd(app.getAppPath());
const Vue = require('vue/dist/vue.min.js');
const R = require('ramda/dist/ramda.min.js');

// import 
// use an alias for my stuff
// import * as prs from "./prs/prs"




//sweet... so let's load the external JSON and data so 
//we can pass it around to the pure functions

const database = appDir.read("database.json", "json");
const main_dump = appDir.read("main_dump.json", "json");

//setup neDB so we can ditch the excell sheets 




//setup Vue :: controls the front-end

let vtemplates = {

  block: /* syntax:html */`

  	<div>
  		<div>

  			<slot></slot>

  		</div>
  	</div>`,

 }

let vueComps = [

      {
        "name":'block-wrap',
        "props":[''],
        "html":'block'
      }
 ]


function vComp(arr){

    R.forEach(function(n){
      
      var y = R.filter(function(x){ return x.name == n}, vueComps)[0];

      Vue.component(y.name, {
        props:y.props,
        template:vtemplates[y.html],
      });

    }, arr);
};



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


