import React from 'react'
import {Map,InfoWindow,Marker,GoogleApiWrapper} from 'google-maps-react';

class SearchWithinTime extends React.Component{

  render(){
      return(
          <span className="WithinTime">Within <select id="time">
            <option value="10">10</option>
            <option value="15">15</option>
            <option value="30">30</option>
            <option value="60">60</option>
            </select> min <select id="mode"><option value="DRIVING">Drive</option>
                                            <option value="WALKING">walk</option>
                                            <option value="BICYCLING">Bike</option>
                                            <option value="TRANSIT">transit ride</option>
                                            </select> of <input type="text" id="init-Location" placeholder="Ex:California"/> <button type="button" onClick={this.props.Search}>Go!</button></span>
      );
  }
}

export default SearchWithinTime;
