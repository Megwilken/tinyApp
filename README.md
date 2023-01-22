# TinyApp Project

TinyApp is a full stack web application built with Node and Express that allows users to shorten long URLs (à la bit.ly).

## Final Product

Login Page: The initial page for the user to either log in to their account, or be redirected the "Register and Account" page. 
!["screenshot of Login page"](https://github.com/Megwilken/tinyApp/blob/main/docs/loginpage.png?raw=true)


URL Page: Displays a list of all of the logged in or newly registered user's URLs. From this page the user has the option to create a new URL, view/edit an existing URL, or delete a URL. 
!["screenshot of URL page"](https://github.com/Megwilken/tinyApp/blob/main/docs/urlspage.png?raw=true)


URL ID Page: displays the selected Long URL and it's correspondig Short URL. The user can edit the Long URL in this page, or the user can click the Tiny URL to be redirected to the Long URL site. 
!["screenshot of URL ID page"](https://github.com/Megwilken/tinyApp/blob/main/docs/urlidpage.png?raw=true)

## Dependencies

- Node.js
- Express
- EJS
- bcryptjs
- cookie-session

## Getting Started

- Install all dependencies (using the `npm install` command).
- Run the development web server using the `npm start` command.