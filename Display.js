import React from 'react'
import {Map,InfoWindow,Marker,GoogleApiWrapper} from 'google-maps-react';

class DisplayMarker extends React.Component{

  render(){
   console.log(this.props.lat);
   console.log(this.props.lng);
      return(



          <Marker position={{lat:this.props.lat,lng:this.props.lng}} />

      );
  }
}

export default DisplayMarker;
