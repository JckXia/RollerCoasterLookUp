import React from 'react'
import { stack as Menu} from 'react-burger-menu'
import './SideNavigation.css'
class SideNav extends React.Component{

  render(){
  var length=this.props.locations.length;
      return(
        <Menu isOpen={this.props.stat}>
          <h3>Find your ride</h3>
        <input type="text"  onChange={(e)=>this.props.update(e.target.value)} className="filter"  placeholder="Ex:6 flags"/>
         <hr/>

       {this.props.locations&&this.props.locations.map((location,idx)=><span key={location.venue.id}>
       {console.log(length)}
         <a  tabIndex="0" onClick={(e)=>this.props.selection(e)}> <span className="location">{location.venue.name}</span></a>
     <div className="space"></div></span>)}



        </Menu>
      );
  }
}

export default SideNav;
