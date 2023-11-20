import React from 'react';
import LoaderImg from "../../assets/preloader.svg";
import "./Preloader.css";

const Preloader = () => {
  return (
    <div className='loader flex flex-c'>
      <img src = {LoaderImg} alt = "loader" />
    </div>
  )
}

export default Preloader