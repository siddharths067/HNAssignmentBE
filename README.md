# Hacker News Like Service (Backend)

## Models
Sequelize used as an ORM to allow to make the backend service database agnostic
### User Model: 
* Stores the Username and SHA of Password
### Comment Model
* Text - To store the text of the Comment,
* Username - Used to Store the User who posted the comment and to support the Delete Functionality at the Front End
* ReplyTo - Helps store Nested Replies
#### Comment Model Triggers
* Uses a Bulk Delete Trigger
* To Enforce consistency, that is if a parent comment is removed no child comment should be persisted in the database
which might cause un-necessary usage
* The Trigger Deletes the child comments one by one
* Since all the triggers are processed with the help of a Trigger Event Queue in the Database. A BFS-like level order
deletion is expected for the children. This Ensures that in The Frontend the user won't see dangling comments in the
in the immediate level below the current comment.

### Redis Substitution for Upvotes and Downvotes

* Storing Upvotes and Downvotes is a non-trivial task and one could use many models to solve it. I chose to not store it
in the comment model since the uniqueness of users in every vote needs to be respected.
* The only way to solve it in a SQL-ike fashion would've been to store the Upvotes and Downvotes in their own table and
then performing a Upsert operation on the user field.
* The SQL-ike solution would've been un-necessarily expensive and inefficient since the cardinality of votes could be 
humongous and is only bounded by number of user accounts. Performing Select Queries for every Front end page load would
un-necessarily use precious processing time. (One could use a Master Slave way of doing this but it would've been un-necessarily complicated. Not to mention inefficient)
* By using Redis, We have a much faster and idiomatic way of storing set operations for Voting System
* Moreover by separating voting api we could conditionally render them in the front end and thus reduce load by selecting only
votes for comments visible to the user
* The Idea was to allow to only get votes that are visible to the user
* Redis open more opportunities by using it as a Cache and scale it by partitioning using username who posted it as a parameter

## Authorization
* An expiration token assigned to the client which is also set to its cookie. The token can be directly mapped to the user.

## Running and Building it

NOTE: If you don't have DB service running you can just docker-compose build and up it

else 
Create a DB on your MySql server and provide credentials in the file ```database/database_access_object.js``` and run

```docker build -t hnbe .```

```docker run hnbe``` 


## Components Used
* Winston for Logging Errors and Queries
* Redis
* Sequelize
* Express
* Docker