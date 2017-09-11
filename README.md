# Magelo Scrapers
* magelo.com data mining scripts for EverQuest
* Loot: 24k web requests at time of writing

# Installation

<pre>
$ git clone https://github.com/Akkadius/eq-magelo-scrapers.git
Cloning into 'eq-magelo-scrapers'...
remote: Counting objects: 16, done.
remote: Total 16 (delta 0), reused 0 (delta 0), pack-reused 16
Unpacking objects: 100% (16/16), done.
Checking connectivity... done.
</pre>

## Install modules (Init)
<pre>
cd eq-magelo-scrapers/

npm install
npm WARN magelo_scrape@1.0.0 No repository field.

added 89 packages in 2.48s
</pre>

## Set Database Config options in config.json
* Set Database Config options in config.json: you need these params set for MySQL connectivity
* Add Schema .sql's from the Repo 

## Run a script corresponding to the type of data you want to pull down
* Example (loot):
<pre>
node magelo_loot_scrape.js
Connected!
Still polling zones
Still polling zones
Zone: qrg NPCs: 66
Zone: southkarana NPCs: 141
Zone: cshome NPCs: 53
Zone: blackburrow NPCs: 43
Zone: runnyeye NPCs: 78
Zone: freportn NPCs: 102
Zone: freporte NPCs: 0
Zone: freportw NPCs: 0
Zone: permafrost NPCs: 110
Zone: nektulos NPCs: 212
Zone: erudnint NPCs: 88
Zone: paw NPCs: 72
Zone: airplane NPCs: 115
Zone: steamfont NPCs: 98
</pre>
