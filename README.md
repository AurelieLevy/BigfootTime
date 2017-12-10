# BigfootTime
<p align="center"> 
    <img width="300" alt="Bigfoot walking" src="docs/resources/images/gif/walking.gif">
 </p>

## Informations
You can find our web pages here: https://aurelielevy.github.io/BigfootTime/
<br>
<br>
This projet was made as part of a laboratory for the course named TWEB (HEIG-VD).
It's about the Bigfoot. We've used some datas to create charts with D3. The goal was firstly to learn to use it. In any case the informations we give are not to take seriously! The datas we used are findable on the web (see the part name Data in this file)
Our goal was to make something funny, and we used some informations that are not verified.

## Data
You can find the data we used under the "docs/data" of this project. These data are publicly avaiable on internet, and can be found there:
* Bigfoot reports with location and time
    * Direct download: https://raw.githubusercontent.com/AurelieLevy/BigfootTime/master/docs/data/bfru.geojson
    * Source: https://data.world/timothyrenner/bfro-sightings-data
* Population by USA state
    * Direct download: https://raw.githubusercontent.com/AurelieLevy/BigfootTime/master/docs/data/population.csv
    * Source: https://www.google.ch/publicdata/explore?ds=kf7tgg1uo9ude_&met_y=population&hl=en&dl=en
* Religion rate by USA state
    * Direct download: https://raw.githubusercontent.com/AurelieLevy/BigfootTime/master/docs/data/religious.csv
    * Source: http://www.thearda.com/Archive/Files/Descriptions/RCMSST.asp
* USA map (geojson):
    * Direct download: https://raw.githubusercontent.com/AurelieLevy/BigfootTime/master/docs/data/us.json

A major part of Bigfoot datas where recolted by "The Bigfoot Field Researchers Organization" founded in 1995. They allow you to report your sighting and ask you to describe it to keep their data updated.

## Treatements of the data
There are 3 D3 graphs within the website we did. Each of these used the USA map (source above), a GeoJSON file describing USA by state. 
### Religion map
The first one is about religion rate by state, shown in a map. 3 other dataset than the US map is used there:
 * The Bigfoot reports (source above): we have grouped the number of Bigfoot seen by state, thank's to the Crossfilter Library (http://square.github.io/crossfilter/)
 * The population by USA state (source above): The number of Bigfoot reports has been devided by the number of people state by state, to have relativly comparable data.
 * The religion rate by state (source above): We used these data to show a bar over each state
### Bigfoot reports
The second chart shows where the bigfoot has been reported to be seen. We used these datasets other than the USA map:
* The Bigfoot reports (source above): it is possible to filter by year the reports to show on the map clicking on a bar. To do so, we used once again Crossfilter. When the user's mouse points over a point on the map, the related report is shown below of the map.
We should have been able to zoom in the map, the number of reports exceding what it is possible to show on a map. However, we did not have the time to implement this function.

## Authors
We are two people. Here are our github:
 * https://github.com/remij1
 * https://github.com/AurelieLevy

