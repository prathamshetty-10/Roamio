const host="http://localhost:5001";
const registerRoute=`${host}/api/auth/register`;
const loginRoute=`${host}/api/auth/login`;
const profileRoute=`${host}/api/auth/profile`;
const getFriendsRoute=`${host}/api/friend/getFriends`;
const removeFriendsRoute=`${host}/api/friend/removeFriends`;
const searchFriendsRoute=`${host}/api/friend/searchFriends`;
const getRequestsRoute=`${host}/api/friend/getRequests`;
const sendRequestsRoute=`${host}/api/friend/sendRequests`;
const acceptRequestsRoute=`${host}/api/friend/acceptRequests`;
const rejectRequestsRoute=`${host}/api/friend/rejectRequests`;
const getTripsRoute=`${host}/api/trip/getTrips`;
const addTripsRoute=`${host}/api/trip/addTrips`;
const removeTripsRoute=`${host}/api/trip/removeTrips`;
const leaveTripsRoute=`${host}/api/trip/leaveTrips`;
const editTripsRoute=`${host}/api/trip/editTrips`;
const editMembersRoute=`${host}/api/trip/editMembers`;
const uploadPhotosRoute=`${host}/api/trip/uploadPhotos`;
const getPhotosRoute=`${host}/api/trip/getPhotos`;
const deleteSingleRoute=`${host}/api/trip/deleteSingle`;
const deleteAllRoute=`${host}/api/trip/deleteAll`;
const downloadAllRoute=`${host}/api/trip/downloadAll`;
const downloadOneRoute=`${host}/api/trip/downloadOne`;
export {registerRoute,loginRoute,profileRoute,getFriendsRoute,searchFriendsRoute,getRequestsRoute,sendRequestsRoute,acceptRequestsRoute,
    rejectRequestsRoute,removeFriendsRoute,getTripsRoute,addTripsRoute,removeTripsRoute,leaveTripsRoute,editMembersRoute,editTripsRoute,
uploadPhotosRoute,getPhotosRoute,deleteAllRoute,deleteSingleRoute,downloadAllRoute,downloadOneRoute}