import AddPostIcon from './images/AddPostIcon.svg';
import addsIcon from './images/addsIcon.svg';
import allActivitiesIcon from './images/allActivitiesIcon.svg';
import bellIcon from './images/bellIcon.svg';
import blogIcon from './images/blogIcon.svg';
import buildingIcon from './images/buildingIcon.svg';
import chatIcon from "./images/chatIcon.svg";
import heartIcon from './images/heartIcon.svg';
import listingAndDeleteIcon from './images/listingAndDeleteIcon.svg';
import lockIcon from './images/lockIcon.svg';
import logoutIcon from './images/logoutIcon.svg';
import mailIcon from './images/mailIcon.svg';
import myListIcon from './images/myListIcon.svg';
import phoneIcon from './images/phoneIcon.svg';
import quickActionIcon from './images/quickActionIcon.svg';
import renewIcon from './images/renewIcon.svg'
import sellIcon from './images/sellIcon.svg';
import starIcon from './images/starIcon.svg';
import supportIcon from './images/supportIcon.svg';
import termAndCondition from './images/termAndCondition.svg';
import timeIcon from './images/timeIcon.svg';
import userIcon from './images/userIcon.svg';
import carImage from './images/carImage.png';
import girlImage from './images/girlImage.png';


export const profileAssets = {
    starIcon,
    AddPostIcon,
    userIcon,
    bellIcon,
    lockIcon,
    myListIcon,
    buildingIcon,
    blogIcon,
    supportIcon,
    termAndCondition,
    addsIcon,
    logoutIcon,
    carImage,
    girlImage,
    phoneIcon,
    mailIcon,
    chatIcon,
    sellIcon
}



// Profile Options
export const profileOptions = [
    {
        id: 1,
        title: "Saved",
        icon: heartIcon,
        values: 7
    },
    {
        id: 2,
        title: "Messages",
        icon: chatIcon,
        values: 4
    },
    {
        id: 3,
        title: "Reviews",
        icon: starIcon,
        values: null
    },
    {
        id: 4,
        title: "Vieved",
        icon: timeIcon,
        values: null
    }
];


// Selling Options or Activites
export const sellingOptions = [
    {
        id: 1,
        title: "Selling Listings",
        vlaues: 3,
        icon: sellIcon
    },
    {
        id: 2,
        title: "Quick Actions",
        values: null,
        icon: quickActionIcon
    },
    {
        id: 3,
        title: "All Activities",
        values: null,
        icon: allActivitiesIcon
    }
]

// Selloing Overview
export const sellingOverview = [
    {
        id: 1,
        title: "Chats",
        icon: chatIcon,
    },
    {
        id: 2,
        title: "Active Listings",
        icon: sellIcon
    },
    {
        id: 3,
        title: "Listings To Renew",
        icon: renewIcon
    },
    {
        id: 4,
        title: "Listings To Delete",
        icon: listingAndDeleteIcon
    }
]

// Selling Performance
export const sellingPerformance = [
    {
        id: 1,
        values: null,
        title: null,
        icon: null
    },
    {
        id: 2,
        vlaues: null,
        title: "Clicks on Listings Last 7 Days",
        icon: null
    },
    {
        id: 3,
        values: 2,
        title: "Click on Listings",
        icon: starIcon,
        ratings: 4
    }
]