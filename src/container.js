import {Map, InfoWindow, Marker, GoogleApiWrapper} from 'google-maps-react';
import React from 'react';
export class MapContainer extends React.Component{
   render(){
      if(!this.props.loaded){
        return <div>Loading...</div>
      }
      return (
        <div>Map will go here </div>
      )
   }
}

export default GoogleApiWrapper(
 apiKey:(AIzaSyBNkc1Jx7eWA-9Q8ewT5CzVYSyeP5gdyK8)
)(MapContainer)
