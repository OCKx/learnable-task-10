# TASK 10

In an ongoing hotel management project, the backend developer, having looked at the Figma design, is tasked to chunk out some APIS in vanilla javascript using NodeJs and ExpressJs for the frontend to consume;

CreateDB collection for storage of room types and rooms, respectively

Create a POST endpoint/API for storage of roomtype in the following format {

“_id”: ObjectId,

“name”: string

} POST - {{baseUrl}}/api/v1/rooms-types

Create a GET endpoint for fetching of all room types GET - {{baseUrl}}/api/v1/rooms-types

Create a POST endpoint for storage of rooms in the following format { “_id”: ObjectId, “name”: string,

“roomType”: ObjectId,

“price”: number } POST - {{baseUrl}}/api/v1/rooms

Create a GET endpoint for fetching all the rooms (add filters in the following formats) GET - {{baseUrl}}/api/v1/rooms?search={searchRoomNameMatch}&roomType={searchRoomTypeNameMatch}&minPrice={searchRoomMinimumPriceMatch}&maxPrice={searchRoomMaximumPriceMatch}

Available queries are the search, roomType, minPrice& maxPrice, which are meant to be optional queries on the db unless when the user passes them on the endpoint. Note that when only maxPrice is passed, consider the minPrice 0

Create a PATCH endpoint for editing a room using its id PATCH - {{baseUrl}}/api/v1/rooms/{roomId}

Create a DELETE endpoint or deleting a room using its id DELETE - {{baseUrl}}/api/v1/rooms/{roomId}

Create a GET endpoint for fetching a room using its id GET - {{baseUrl}}/api/v1/rooms/{roomId}