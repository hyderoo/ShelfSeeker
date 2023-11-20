import React from 'react';
import "./Profile.css";
import profileImg from "../../assets/profileimg.jpg";
import { FaInstagram, FaGithub, FaLinkedin } from 'react-icons/fa';

const Profile = () => {
  const handleIconPress = (socialMedia) => {
    let url;
    switch (socialMedia) {
      case 'instagram':
        url = 'https://www.instagram.com/capybara373_/';
        break;
      case 'github':
        url = 'https://github.com/hyderoo/';
        break;
      case 'linkedin':
        url = 'https://www.linkedin.com/in/hafiz-hamdani-7277b4290/';
        break;
      default:
        break;
    }
    if (url) {
      window.open(url, '_blank');
    }
  };

  return (
    <section className='profile'>
      <div className='container'>
        <div className='section-title'>
        </div>

        <div className='profile-content grid'>
          <div className='profile-img'>
            <img src={profileImg} alt="" />
          </div>
          <div className='profile-text'>
            <h2 className='profile-title fs-26 ls-1'>About me</h2>
            <p className='fs-18 justify'>Hello, I'm Hafiz Hamdani, a student in Computer Engineering at Diponegoro University. My student ID is 21120121140106. I am passionate about exploring the vast world of computer technology, seeking to understand and contribute to the ever-evolving field. As a dedicated learner, I am committed to acquiring new skills and knowledge to make a positive impact in the world of computer science. Feel free to connect with me to share ideas and insights on this exciting journey!</p>
            <div className='socialIcons'>
              <button onClick={() => handleIconPress('instagram')}>
                <FaInstagram size={30} color="#405DE6" />
              </button>
              <button onClick={() => handleIconPress('github')}>
                <FaGithub size={30} color="#211F1F" />
              </button>
              <button onClick={() => handleIconPress('linkedin')}>
                <FaLinkedin size={30} color="#0077B5" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default Profile;
