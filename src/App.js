import React, { Component } from 'react'
import {Map,InfoWindow,Marker,GoogleApiWrapper} from 'google-maps-react'
import * as util from 'util' // has no default export
import { inspect } from 'util' // or directly
import logo from './logo.svg';
import escapeRegExp from 'escape-string-regexp'
import SearchWithinTime from './SearchTime'
import SideNav from './SideNavigation'
import home from './home.svg';
import './App.css';
import './InfoWindow.css'
var ListOfInfoWindow=[];
var Mark=[];
var utils = require('util')
class App extends Component {

  state = {

       lat:  43.856098,
       lng:-79.337021,
       targetMarker:{},
       targetMarkerId:null,
       targetMarkerInfo:{},
      activeMarker: [],
      UnfilteredMarker:[],
      NavMarker:[],
      animation:1,
      temp:[],
      query:''
    };

componentDidMount(){
   this.getData();
}

selectMarker=(e)=>{
  var targetMarker={};
    var place=e.target.innerText;
  for(var i=0;i<ListOfInfoWindow.length;i++){
    if(place==ListOfInfoWindow[i].name){
      targetMarker=ListOfInfoWindow[i];
      break;
    }
  }

targetMarker.setAnimation(1);
 this.setState({
   targetMarker:targetMarker
 })
 var active=this.state.activeMarker;
 for(var i=0;i<active.length;i++){

  if(active[i].venue.name==targetMarker.name){
    var id=active[i].venue.id;
    break;
  }
 }
 this.setState({
   targetMarkerId:id
 })

 console.log(id);
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

QueryUpdate=(query)=>{

 this.setState({query});
  if(query==''){

  }
 if(this.state.query){

   if(query==''){

     this.setState({
       activeMarker:this.state.UnfilteredMarker
     })
   }
   else{
   const match=new RegExp(escapeRegExp(this.state.query),'i')


   this.setState((state) => {
    return {activeMarker:state.UnfilteredMarker.filter((contact)=>match.test(contact.venue.name))};
  });
 }
}
}

//LocationLookUp looks up user location
LocationLookUp=(origin,ref)=>{
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


searchWithinTime=(origin)=>{


  //setState took effect imediatly
  //Here, we refoucs the center of the map to wherever we are searching
this.LocationLookUp(origin,this);

   //Get the 'distanceMatrixService' from the google API
  var distanceMatrixService=new this.props.google.maps.DistanceMatrixService;

 //Intialize diestination array to store the amusment parks
   var destinations=[];

  //Since the current activeMarker stores all locations of amusment parks given nearby location
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
         //console.log(res);
         var address=res.destinationAddresses;
         var result=res.rows["0"].elements;
        var data=[];
        //  console.log(result);
        var acc=0;
          for(var i=0;i<UnfilteredDest.length;i++){
             if(result[i].status=='OK'){
               var duration=result[i].duration.value/60;


               if(duration<=maxDuration){
                 data[acc]=UnfilteredDest[i];

                 acc++;
               }
             }

          }


          ref.setState({
            activeMarker:data,
            UnfilteredMarker:data,
          })

       }
    });


}

getMarkerInformation=()=>{
  console.log(this.state.targetMarkerId);
  var id=this.state.targetMarkerId;

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
    //console.log(data.response.groups[0].items);
 this.setState({temp:data.response.groups[0].items});
  this.searchWithinTime(origin);
}
}).catch((error)=>{
 console.log('Error! '+error);
})

}

ShowInfoWindow=(props,marker,e)=>{

  //For an individual infowindow, we need
  //1. Its name (Good)
  //2. Its rating (check required)
  //3. Its contact information (Check required)
  //4. Address (good)
  //Make one more API call on clicked marker


  var Active=this.state.activeMarker;

  var info={};
 for(var i=0;i<Active.length;i++){
   if(marker.name==Active[i].venue.name){
     info=Active[i];
   }
 }


this.setState({
  targetMarkerId:info.venue.id
})
 this.setState({
   targetMarker:marker
 })
 console.log(marker);
 this.getMarkerInformation();
}

 GetMarkerObjects=(marker)=>{
   if(marker){
     ListOfInfoWindow.push(marker.marker);
   }

  //ListOfInfoWindow.push(marker.marker);
}

DisplayMarkers=()=>{

  var ListOfMarkers=[<Marker key={'home'} icon={home}position={{lat:this.state.lat,lng:this.state.lng}}/>];
   var active=this.state.activeMarker;
  console.log(this.state.targetMarker.name);
  var target=this.state.targetMarker.name;
  var flag=0;
    for(var i=0;i<active.length;i++){
      if(target==active[i].venue.name){
        console.log('Check');
        flag=1;
      }
      ListOfMarkers.push(<Marker  animation={this.state.animation&&flag} ref={this.GetMarkerObjects} onClick={this.ShowInfoWindow} key={active[i].referralId} name={active[i].venue.name}  position={{lat:active[i].venue.location.lat,lng:active[i].venue.location.lng}}/>);
      flag=0;
    }
    Mark=ListOfMarkers;


  return(
    ListOfMarkers
  )
}

DisplayContact=()=>{
  if(this.state.targetMarkerId){

    var contact=this.state.targetMarkerInfo.contact;

    var retval=[];
    for(let key in contact){

      var value=contact[key];
      retval.push({key,value});

    }

    return(
     <table>


       {retval.map((contact)=><tr key={contact.key}><td>{contact.key}</td><td>{contact.value}</td></tr>)}


     </table>
    )
  }
}




  render() {
    var points=[
      {lat:42.02,lng:-77.01},
      {lat:42.03,lng:-77.02},
      {lat:41.03,lng:-77.04},
      {lat:42.05,lng:-77.02}
    ];

   var searchAutoComplete=new this.props.google.maps.places.Autocomplete(document.getElementById('init-Location'));
    return (
      <div className="App">

     <SideNav selection={(e)=>this.selectMarker(e)}   update={this.QueryUpdate} locations={this.state.activeMarker}/>

        <header className="App-header">

          <span><span className="credit">Powered By React.js</span><img src={logo} className="App-logo" alt="logo" /></span>
        <h1 className="App-title">Find your ride!</h1>
      <SearchWithinTime Search={this.getData} />
        </header>
        <Map google={this.props.google}
            center={{
          lat:this.state.lat,
          lng:this.state.lng
        }}

          zoom={15}>


       {this.DisplayMarkers()}


      <InfoWindow   marker={this.state.targetMarker}  visible={true}>
   <div>

    <h1> {this.state.targetMarker.name} </h1>
  <h2>{'rating '+this.state.targetMarkerInfo.rating}</h2>
<h3>{'Description '+this.state.targetMarkerInfo.description}</h3>
{this.DisplayContact()}
   </div>

      </InfoWindow>



        </Map>

      </div>
    );
  }
}


export default GoogleApiWrapper({
  apiKey: ("AIzaSyBNkc1Jx7eWA-9Q8ewT5CzVYSyeP5gdyK8")
})(App)
