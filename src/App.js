import React, { Component } from 'react';
import {Map,InfoWindow,Marker,GoogleApiWrapper} from 'google-maps-react';
import { elastic as Menu} from 'react-burger-menu';
import logo from './logo.svg';
import RollerCoaster from './RollerCoaster.svg';
import SearchWithinTime from './SearchTime'
import './App.css';
class App extends Component {
  state = {
      showingInfoWindow: false,
       lat:  36.778259,
       lng:-119.417931 ,
      activeMarker: []
    };

componentDidMount(){
   this.getData();
}

LocationLookUp=(origin,ref)=>{
  var geocoder=new this.props.google.maps.Geocoder();
   geocoder.geocode({address:origin},function(res,stat){
       if(stat=='OK'){

     var lat=res["0"].geometry.location.lat();
     var lng=res["0"].geometry.location.lng();
     console.log(lat);
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
  var UnfilteredDest=this.state.activeMarker;
      UnfilteredDest=UnfilteredDest[0].items;
    for(var i=0;i<UnfilteredDest.length;i++){
      destinations[i]=new this.props.google.maps.LatLng(UnfilteredDest[i].venue.location.lat, UnfilteredDest[i].venue.location.lng);
    }
    //Grab mode of transportation
  var mode=document.getElementById('mode').value;
  //Grab the maxDuration used
  var maxDuration=document.getElementById('time').value;

   console.log(mode);

 //Use getDistanceMatrix to find the positions within the time
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
          for(var i=0;i<UnfilteredDest.length;i++){
             if(result[i].status=='OK'){
               var duration=result[i].duration.value/60;
               //console.log(duration);
               if(duration<=maxDuration){
                 data[i]=UnfilteredDest[i];
               }
             }
          }
          //console.log(data);

       }
    });

}

getData=()=>{

  var origin=document.getElementById('init-Location').value;
  if(!origin){
    origin='Markham,Ontario';
  }
  fetch('https://api.foursquare.com/v2/venues/explore?client_id=QALO2MLFP24PDJJ5VK3VYOYXIKO2RS3NV2FNQMPS3OOSJHHG&client_secret=TGQZJJ30WI44XGBLMQ0B5L4NH4VYBMVV3GM32HJCQOWJTGWJ&v=20180323&limit=10&near='+origin+'&query=Amusement+park',{
 method:"GET",
 dataType:"JSON"
}).then((resp)=>{
  return resp.json()
}).then((data)=>{

  if(!data.response.totalResults){
    alert('Whoops, nothing found!');
  }else{
 this.setState({activeMarker:data.response.groups});
 this.searchWithinTime(origin);
}
}).catch((error)=>{
 console.log('Error! '+error);
})
}
  onMarkerClick=(props,marker,e)=>this.setState({
    selectedPlace:props,
    activeMarker:marker,
    showingInfoWindow:true
  });




  render() {
    var points=[
      {lat:42.02,lng:-77.01},
      {lat:42.03,lng:-77.02},
      {lat:41.03,lng:-77.04},
      {lat:42.05,lng:-77.02}
    ];
   console.log(this.props.google.maps.places)
   var searchAutoComplete=new this.props.google.maps.places.Autocomplete(document.getElementById('init-Location'));
    return (
      <div className="App">
        <Menu>
          <h3>Find your ride</h3>
        <input type="text" className="filter" placeholder="Ex:6 flags"/>
         <hr/>


       <div className="container" height="10"> <span><img src={RollerCoaster} className="place-icon" alt="locations"/><span className="locations"> 21 lindisfarne Way </span></span>

         </div>
      <div className="space"></div>

    <div className="container" height="10"> <span><img  className="place-icon" src={RollerCoaster}  alt="locations"/><span className="locations"> 21 lindisfarne Way </span></span>

        </div>
     <div className="space"></div>
        </Menu>
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
        </Map>
      </div>
    );
  }
}


export default GoogleApiWrapper({
  apiKey: ("AIzaSyBNkc1Jx7eWA-9Q8ewT5CzVYSyeP5gdyK8")
})(App)
