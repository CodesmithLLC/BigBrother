# Big Picture

- Integrate with Student DB
- Slack Integration - For Notifications and/or interactions
- Floobits Integration - For Peer Programming
- Scalability
- Send more information

# Front End
  -UX - Intuitive, Easy, Not Overwhelming
  -Styling - Code Smith Styling
  -Graphs - Choosing the right graphing library (or none)


### Student-Monitor

-We can explicitly turn it off


### Slack intergration
-oAuth with Slack
-/helprequest or /hr
  -will send snapshot
  -notifies in Slack
  -sends snapshot link in slack to TAs
    -Adds relevent info

### Floobits Integration
-Facilitate Peer Programming
-Join peer Programming Sessions
  -Findout who is typing
    -Gather data
-Possibly Fork etherpad (ideally not)

### Cluster
  -Organize Micro Processes
  -Scalability

### Send More Information
  -Test Results
    -npm test -silent -- -reporter=JSON
    -standardize all units
  -JSCS (Code Style) Results
    -Build Parser
    -Create Code Smith Code Style

### Broadcasting Algorithm
  -Generate a Tree
  -Allow Users to Enter and Exit
    -On enter-User gets a parent, parent send video to child
    -On leave-If Leaver had children
      -Leaver is replaced with a childless User
        -Connects to Leavers parent
        -Leavers children Connect to childless User
  -When Broadcaster is destroyed, Wait for broadcaster, replace or destroy the tree
  -Recognize Race conditions
    -Recognize need for atomic operations
    -Recognize where cluster/sharding can occur

### Admin Panel
  -Add Students
  -Add TAs
  -Watch TAs
  -Watch all Admin actions
  -Monitor Cluster
    -Aspects that are up/down and how many

### Possibly Have a "Git Server"
  -This is where we will hold the snapshots of the users folders
  -We can commit arbitrary FS changes so we can make an accurate diff between saves
