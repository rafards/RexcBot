let nextStep

if(!raceState.raceName){

 nextStep = "race_name"

}
else if(!raceState.raceType){

 nextStep = "registration"

}
else if(!raceState.lap){

 nextStep = "lap"

}
else if(!raceState.slot){

 nextStep = "slot"

}
else if(!raceState.time){

 nextStep = "race_time"

}
else{

 nextStep = "deploy"

}
