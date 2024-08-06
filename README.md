<h1 align="center">Quora-mock API</h1>

###

<p align="left">Since I am currently studying the backend part of a full stack developer course, I want to try a backend project to test what I have learned. Therefore, this project has been created.<br><br>This project uses a tech stack including Javascript, PostgreSQL, Node.js, Express, and Swagger.<br><br>Feel free to look it over and comment; I am open to all feedback.</p>

###

<div align="center">
  <img src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/javascript/javascript-original.svg" height="40" alt="javascript logo"  />
  <img width="12" />
  <img src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/nodejs/nodejs-original.svg" height="40" alt="nodejs logo"  />
  <img width="12" />
  <img src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/postgresql/postgresql-original.svg" height="40" alt="postgresql logo"  />
  <img width="12" />
  <img src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/express/express-original.svg" height="40" alt="express logo"  />
</div>

###

<p align="left">Here are the explanations of API documents<br><br>1.  method: GET<br>    endpoint: "/questions/search" <br>    used for searching questions with question's title or category.<br><br>2.  method: GET<br>    endpoint: "/questions"<br>    used for retrieving all questions.<br><br>3.  method: GET<br>    endpoint: "/questions/{id}<br>    used for retrieving question by question_id.<br><br>4.  method: POST<br>    endpoint: "/questions"<br>    used for creating a new question.<br><br>5.  method: POST<br>    endpoint: "/questions/{id}/upvote"<br>    used for increasing vote for a question by question_id.<br><br>6.  method: POST<br>    endpoint: "/questions/{id}/downvote"<br>    used for decreasing vote for a question by question_id.<br><br>7.  method: PUT<br>    endpoint: "/questions/{id}"<br>    used for updating a question by question_id.<br><br>8.  method: DELETE<br>    endpoint: "/questions/{id}"<br>    used for deleting a question by question_id, its answers included.<br><br>9.  method: POST<br>    endpoint: "/questions/{id}/answers"<br>    used for creating an answer of a question by question_id.<br><br>10. method: POST<br>    endpoint: "/answers/{id}/upvote"<br>    used for increasing an answer's vote by answer_id.<br><br>11. method: POST<br>    endpoint: "/answers/{id}/downvote"<br>    used for decreasing an answer's vote by answer_id.<br><br>12. method: GET<br>endpoint: "/questions/{id}/answers"<br>used for retrieving all answers by question_id.</p>

###
