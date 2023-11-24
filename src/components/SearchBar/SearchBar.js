import React, {useRef, useEffect} from 'react';
import {FaSearch} from "react-icons/fa";
import { useNavigate } from 'react-router-dom';
import { useGlobalContext } from '../../appprovider';
import "./SearchBar.css";

const SearchBar = () => {
  const {setSearchTerm, setResultTitle} = useGlobalContext();
  const searchText = useRef('');
  const navigate = useNavigate();

  useEffect(() => searchText.current.focus(), []);
  const handleSubmit = (e) => {
    e.preventDefault();
    let tempSearchTerm = searchText.current.value.trim();
    if((tempSearchTerm.replace(/[^\w\s]/gi,"")).length === 0){
      setResultTitle("Please Enter Something ...");
    } else {
      setSearchTerm(searchText.current.value);
    }

    navigate("/");
  };

  return (
    <div className='searchbar'>
      <div className='container'>
        <div className='search-form-content'>
          <form className='searchbar' onSubmit={handleSubmit}>
            <div className='search-form-elem flex flex-sb bg-white'>
              <input type = "text" className='form-control' placeholder='Search your fav book' ref = {searchText} />
              <button type = "submit" className='flex flex-c' onClick={handleSubmit}>
                <FaSearch className='text-purple' size = {32} />
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}

export default SearchBar