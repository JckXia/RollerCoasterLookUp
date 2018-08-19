import React, { Component } from 'react'
import {Map,InfoWindow,Marker,GoogleApiWrapper} from 'google-maps-react'


import logo from './logo.svg';
import escapeRegExp from 'escape-string-regexp'
import SearchWithinTime from './SearchTime'
import SideNav from './SideNavigation'
import home from './home.svg';
import './App.css';
import './InfoWindow.css'
var ListOfInfoWindow=[];
var Mark=[];
var InfoWindowVis=true;
class App extends Component {

  state = {
        //InfoWindow visibility

        //Center of the map
       lat:  43.856098,
       lng:-79.337021,

       //The marker that is being selected
       targetMarker:{},
       targetMarkerId:null,
       targetMarkerInfo:{},

       //Live locations,displays markers being displayed on the map as well as on the side menu
      activeLocation: [],
      UnfilteredLocation:[],
      temp:[],
      query:''
    };

componentDidMount(){
   this.getData();
}


setTargetMarker=(marker,id)=>{
  this.setState({
    targetMarker:marker
  })
  this.setState({
    targetMarkerId:id
  })
  fetch('https://api.foursquare.com/v2/venues/'+id+'?'+'&oauth_token=20WP0A2F535WUKLRM524E1AZPED250DCPLHAOHIOWHTJ1U53&v=20180813' ,{

    method:"GET",
    dataType:"JSON"
  }).then((resp)=>{
     return resp.json()
  }).then((data)=>{

   this.setState({
     targetMarkerInfo:data.response.venue
   })
  }).catch((error)=>{
    console.log('Error')
  })
}
selectMarker=(e)=>{
  InfoWindowVis=true;
  var targetMarker={};
    var place=e.target.innerText;
  for(var i=0;i<ListOfInfoWindow.length;i++){
    if(place==ListOfInfoWindow[i].name){
      targetMarker=ListOfInfoWindow[i];
      break;
    }
  }



 var active=this.state.activeLocation;
 for(var i=0;i<active.length;i++){

  if(active[i].venue.name==targetMarker.name){
    var id=active[i].venue.id;
    var info=active[i];
    break;
  }

}

this.setTargetMarker(targetMarker,id);

}

QueryUpdate=(query)=>{

 this.setState({query});

 if(this.state.query){

   if(query==''){

     this.setState({
       activeLocation:this.state.UnfilteredLocation
     })
   }
   else{
   const match=new RegExp(escapeRegExp(this.state.query),'i')
    var retval=this.state.UnfilteredLocation.filter((contact)=>match.test(contact.venue.name));
    var targetLocation=null;
   if(this.state.targetMarker){
       targetLocation=this.state.targetMarker.name;
   }
    var exist=0;
    for(var i=0;i<retval.length;i++){
       if(retval[i].venue.name==targetLocation){
         console.log('Good');
         exist=1;
       }
    }
    if(!exist){
      InfoWindowVis=false;
      this.setState({
        targetMarker:null,
        targetMarkerId:null,
        targetMarkerInfo:null,

      })
    }
   this.setState((state) => {
    return {activeLocation:retval};
  });
 }
}
}









/* getData and searchTime are both functions used to process the input by the user in the beginning, in the header file */
getData=()=>{

  var origin=document.getElementById('init-Location').value;
  if(!origin){
    origin='Markham,Ontario';
  }


  fetch('https://api.foursquare.com/v2/venues/explore?client_id=QALO2MLFP24PDJJ5VK3VYOYXIKO2RS3NV2FNQMPS3OOSJHHG&client_secret=TGQZJJ30WI44XGBLMQ0B5L4NH4VYBMVV3GM32HJCQOWJTGWJ&v=20180323&limit=20&near='+origin+'&query=Amusement+park',{
 method:"GET",
 dataType:"JSON"
}).then((resp)=>{
  return resp.json()
}).then((data)=>{

  if(!data.response.totalResults){
    alert('Whoops, nothing found!');
  }else{

 this.setState({temp:data.response.groups[0].items});
  this.searchTime(origin);
}
}).catch((error)=>{
 console.log('Error! '+error);
})

}

//LocationLookUp looks up user location
LocationLookUp=(origin,ref)=>{
  InfoWindowVis=false;
  var geocoder=new this.props.google.maps.Geocoder();
   geocoder.geocode({address:origin},function(res,stat){
       if(stat=='OK'){

     var lat=res["0"].geometry.location.lat();
     var lng=res["0"].geometry.location.lng();

       ref.setState({
         lat:lat,
         lng:lng
       })
       }else{
         alert('Negative');
       }
   });
}

searchTime=(origin)=>{

//this.LocationLookUp sets the center of the map
this.LocationLookUp(origin,this);

   //Get the 'distanceMatrixService' from the google API
  var distanceMatrixService=new this.props.google.maps.DistanceMatrixService;

 //Intialize diestination array to store the amusment parks
   var destinations=[];

  //Since the current activeLocation stores all locations of amusment parks given nearby location
 // We will filter it further with the DistanceMatrixService

  var UnfilteredDest=this.state.temp;

    for(var i=0;i<UnfilteredDest.length;i++){
      destinations[i]=new this.props.google.maps.LatLng(UnfilteredDest[i].venue.location.lat, UnfilteredDest[i].venue.location.lng);
    }


  var mode=document.getElementById('mode').value;

  var maxDuration=document.getElementById('time').value;


var ref=this;

    distanceMatrixService.getDistanceMatrix({
      origins:[origin],
      destinations:destinations,
      travelMode:mode,
      unitSystem:this.props.google.maps.UnitSystem.IMPERIAL,
    },function(res,stat){
       if(stat!=='OK'){
         alert('Error!'+stat);
       }else{

         var address=res.destinationAddresses;
         var result=res.rows["0"].elements;
         //Marker location information
        var data=[];
        var acc=0;
          for(var i=0;i<UnfilteredDest.length;i++){
             if(result[i].status=='OK'){
               var duration=result[i].duration.value/60;

               //If the time is less than maxium Duration,
               if(duration<=maxDuration){
                 data[acc]=UnfilteredDest[i];
                 //Set the travel time property for the location
                data[acc].travelTime=Math.round(duration);
                 acc++;
               }
             }

          }


          ref.setState({
            activeLocation:data,
            UnfilteredLocation:data,
          })

       }
    });


}



ShowInfoWindow=(props,marker,e)=>{

  //For an individual infowindow, we need
  //1. Its name (Good)
  //2. Its rating (check required)
  //3. Its contact information (Check required)
  //4. Address (good)
  //Make one more API call on clicked marker

InfoWindowVis=true;
  var Active=this.state.activeLocation;
  var info={};
 for(var i=0;i<Active.length;i++){
   if(marker.name==Active[i].venue.name){
     info=Active[i];
   }
 }



 this.setTargetMarker(marker,info.venue.id);
}






 GetMarkerObjects=(marker)=>{
   if(marker){
     ListOfInfoWindow.push(marker.marker);
   }

 
}

DisplayMarkers=()=>{


  var ListOfMarkers=[<Marker key={'home'} icon={home}position={{lat:this.state.lat,lng:this.state.lng}}/>];
   var active=this.state.activeLocation;

  var target=null;
  if(this.state.targetMarker){
     target=this.state.targetMarker.name;
  }
  var flag=0;
    for(var i=0;i<active.length;i++){
      if(target==active[i].venue.name){

        flag=1;
      }
      ListOfMarkers.push(<Marker  animation={this.props.google.maps.Animation.BOUNCE&&flag} ref={this.GetMarkerObjects} onClick={this.ShowInfoWindow} key={active[i].referralId} name={active[i].venue.name}  position={{lat:active[i].venue.location.lat,lng:active[i].venue.location.lng}}/>);
      flag=0;
    }
    Mark=ListOfMarkers;


  return(
    ListOfMarkers
  )
}

DisplayContact=()=>{

  if(this.state.targetMarkerId){

    if(this.state.targetMarkerInfo){
    var contact=this.state.targetMarkerInfo.contact;
    var active=this.state.activeLocation;
    var target=this.state.targetMarker;
    var travelTime;
     for(var i=0;i<active.length;i++){
        if(active[i].venue.name==target.name){
          console.log(active[i]);
          travelTime=active[i].travelTime;
        }
     }
    var retval=[];

    for(let key in contact){

      var value=contact[key];
      retval.push({key,value});

    }


    return(
      <div>

        <h1> {this.state.targetMarker&&this.state.targetMarker.name} </h1>
      <span> <h2>rating:   {this.state.targetMarker&&this.state.targetMarkerInfo&&this.state.targetMarkerInfo.rating}</h2> </span>
    <h3>{this.state.targetMarker&&this.state.targetMarkerInfo&&this.state.targetMarkerInfo.description}</h3>
  <h3>ETA: {travelTime+' '} minutes</h3>
  <h3 >Contact</h3>
     <table>


       {retval.map((contact)=><tr key={contact.key}><td>{contact.key}</td><td>{contact.value}</td></tr>)}


     </table>
   </div>
    )
  }
}
}




// Main rednering
  render() {


   var searchAutoComplete=new this.props.google.maps.places.Autocomplete(document.getElementById('init-Location'));
    return (
      <div className="App">


     {/* Side Navigation component */}
     <SideNav selection={(e)=>this.selectMarker(e)}   update={this.QueryUpdate} locations={this.state.activeLocation}/>


   {/* Header portion, where search bars is located */}
        <header className="App-header">

          <span ><span className="credit">Powered By React.js</span><img src={logo} className="App-logo" alt="logo" /></span>
        <h1 className="App-title">Find your ride!</h1>
      <SearchWithinTime Search={this.getData} />
        </header>

        <Map google={this.props.google}
            center={{
          lat:this.state.lat,
          lng:this.state.lng
        }}

          zoom={10}>


       {this.DisplayMarkers()}


     {/* Large InfoWindow which displays information about marker, on update of targetMarker */}
      <InfoWindow   marker={this.state.targetMarker}  visible={InfoWindowVis}>
   <div>

{this.state.targetMarker&&this.DisplayContact()}
   </div>

      </InfoWindow>

        </Map>

      </div>
    );
  }
}

//Google maps api creditationals
export default GoogleApiWrapper({
  apiKey: ("AIzaSyBNkc1Jx7eWA-9Q8ewT5CzVYSyeP5gdyK8")
})(App)
