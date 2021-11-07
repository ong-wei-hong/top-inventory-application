# Inventory Application
<p><a href="https://www.theodinproject.com/paths/full-stack-javascript/courses/nodejs/lessons/inventory-application">link</a> to Project: Inventory Application

<p>A CRUD web app designed to help manage inventory</p>

## Installation
<p>Requires</p>
<ul>
	<li>npm</li>
	<li>A MongoDB account</li>
</ul>

<p>To run:</p>
<p>
	<code>npm install</code> in the root directory<br />
	create a .env file<br />
	put MongoDB's connection string with db specified under MONGODB_URI in .env (remember to encode non alphanumeric characters)<br />
	<code>node populatedb [MONGODB URI]</code> in root directory to populate the db if needed (replace [MONGODB URI] with the actual URI)<br />
	<code>npm start</code> in root directory<br />
	then, go to <a href='localhost:3000'>localhost:3000</a>
</p>

<p>Visit my working demo at <a href="https://inventory-application-1.herokuapp.com/">https://inventory-application-1.herokuapp.com/</a>
