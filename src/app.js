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

const csv = require('csv-parser')

// import 
// use an alias for my stuff
// import * as prs from "./prs/prs"





const database = 'data/database.csv'; //appDir.read("database.json", "json");
const main_dump = 'data/main_dump.csv'; //appDir.read("main_dump.json", "json");
const monthly = 'data/Sept2018.csv';


//setup neDB so we can ditch the excel sheets 




let vtemplates = {
	resize:`
		<div>
			<h1 style="line-height:36px">Convert Jpegs for e-mail</h1>

			<i>Type in the beauty sku #'s below separated by commas. Put a space after each comma</i><br>

			<font color="red" size="2"><b>Dont use hard returns, Don't end the line with a comma.</b></font>
			<br>
			<textarea name="skus" rows="10" cols="50" wrap="soft" v-bind="$root.jobOptions.imageList"> </textarea>
			<br>
			<button onclick="$root.resize()">Convert</button>
		</div>`,

	job:`
		<div>
			<strong>Name of Input File:</strong>
			<input type="text" name="filename" maxlength="15" size="15" v-model="$root.jobOptions.filename">

			<br><br>

			<strong>Code:</strong>
			<select name="code" v-model="$root.jobOptions.code">
				<option selected >Choose one:</option>
				<option>Code BH</option>
				<option>Code GD</option>
			</select>

			<br><br>

			<strong>Display:</strong><br>
			<input type="radio" name="display" value='text' v-model="$root.jobOptions.display"> Text Listing<br>
			<input type="radio" name="display" value='block' v-model="$root.jobOptions.display"> Block Listing<br>
			<input type="radio" name="display" value='none' v-model="$root.jobOptions.display"> No Listing<br>

			<br>
		
			<input type="checkbox" name="write" value='1' v-model="$root.jobOptions.writeCSV"> <b>Write output CSV file </b><br><i>(formated for Quark)</i>

			<br><br>
			<button onclick="$root.submitJob()">Do It!</button>
		</div>`,

	jobcomp:`
		<div>
			<error-msgs></error-msgs>
			<br>
			<job-section></job-section>
			<br>
			<resize-section></resize-section>
			<br><br><br><br>

			<div v-html="JSON.stringify(atom.parseMonthly)"></div>
		</div>`,

	errors:`
		<div>
			<div id="noFilename" class="error" style="display:none">Please define the source file.</div>
			<div id="noCode" class="error" style="display:none">Please define the Code type (Code BH or Code GD).</div>
			<div id="noSource" class="error" style="display:none">The source file does not exist.</div>
			<div id="noDisplay" class="error" style="display:none">Please choose a display type.</div>
		</div>`,

	block:`
		<div>
			<div>

				<slot></slot>

			</div>
		</div>`,
 }


let vueComps = [

	{
        "name":'job-section',
        "props":[],
        "html":'job'
    },

	{
        "name":'resize-section',
        "props":[],
        "html":'resize'
    },

	{
        "name":'job-screen',
        "props":[],
        "html":'jobcomp'
    },
    {
        "name":'error-msgs',
        "props":[],
        "html":'errors'
    },

    {
        "name":'block-wrap',
        "props":[],
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

vComp([

      "job-section",
      "resize-section",
      "job-screen",
      "error-msgs",
      "block-wrap"
    ]);




//setup Vue :: controls the front-end

global.atom = new Vue({

	el:"#app",

	data:{

		database:[],
		maindump:[],
		monthly:[],
		result:[],

		comp:'',
		jobOptions:{
			'filename':'',
			'code':'',
			'display':'',
			'writeCSV':'',
			'imageList':''
		},
		screens:{

			'title':'title-screen',
			'runjob':'job-screen',
			'results':'result-screen',
			'editor':'edit-screen'
		},

		blocks:{
			
			'smallBlock':0,
			'bigBlockFront':0,
			'bigBlockBack':0,
			'bigBlockInside':0
		}
	},

	created:function(){

		var vm = this;

		vm.$set(vm,'maindump', vm.convertCSV(main_dump));
		vm.$set(vm,'database', vm.convertCSV(database));
		vm.$set(vm,'monthly', vm.convertCSV(monthly));

	},

	mounted:function(){

		var vm = this;

		vm.$set(vm,'comp',vm.screens['runjob']);

	},
	computed:{

		parseMonthly: function(){

			var vm = this;

			return R.map(function(n){

				n.product_ids = n.product_ids.split(',');
				n.bonus = n.bonus ? `${n.bonus}_icon.jpg` : '';

				return n;

			}, vm.monthly);

		},
	},

	methods:{

		convertCSV:function(file){

			var vm = this;

			var result = [];

			appDir.createReadStream(file)
			  .pipe(csv())
			  .on('data', (data) => result.push(data))
			  .on('end', () => {

			    //console.log(result);
			    
			  });

			  return result;
		},

		submitJob:function(){

			var vm = this;

			if(vm.jobOptions.filename && vm.jobOptions.code && vm.jobOptions.display && vm.jobOptions.writeCSV){

				vm.comp = vm.screens['results'];

				//vm.$set(vm,'monthly', vm.convertCSV(monthly));

			} else {



			}

		},

		

		resize: function(){


		},

		getProduct:function(id){

			//R.find in main

		},

		getProductFromRaw:function(){

			//R.find in raw

		}

	}

})


