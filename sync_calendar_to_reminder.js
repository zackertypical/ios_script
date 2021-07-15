/**
 * @author [zackerzhuang]
 * @email [zackerzhuang@outlook.com]
 * @create date 2021-07-15 21:44:00
 * @modify date 2021-07-15 21:44:00
 */


var dur_month = 1

const startDate = new Date()
startDate.setMonth(startDate.getMonth() - dur_month)
console.log(`日历的开始时间 ${startDate.toLocaleDateString()}`)

const endDate = new Date()
endDate.setMonth(endDate.getMonth() + dur_month)
console.log(`日历的结束时间 ${endDate.toLocaleDateString()}`)


event_cals = await Calendar.forEvents()
reminder_cals = await Calendar.forReminders()
titles = reminder_cals.map(e=>e.title).filter(v=>event_cals.map(e=>e.title).includes(v))
// titles = "test"
console.log(`日历列表:${titles}`)
event_cals = event_cals.filter(v=>titles.includes(v.title))
reminder_cals = reminder_cals.filter(v=>titles.includes(v.title))

reminder_map = {}
reminder_cals.forEach(r=>reminder_map[r.title] = r)

const events = await CalendarEvent.between(startDate, endDate, event_cals)
// console.log(events)

const reminders = await Reminder.allDueBetween(startDate, endDate,reminder_cals)

//找出没有创建对应reminder的event，创建reminder
event_id_set = new Set(events.map(e=>e.identifier))
// console.log([...event_id_set])
reminder_created = reminders.filter(e=>e.notes!=null && e.notes.includes("[Event]"))
reminder_created.forEach(r=>{  
  reg = /(\[Event\])\s([A-Z0-9\-\:]*)/;
  s = r.notes.match(reg);
  if(!event_id_set.has(s[2])){
//     console.log(s[2])
    r.remove();
    console.log("删除reminder:"+r.title)
  }
});

events.forEach(e=>{  
  targetNote = `[Event] ${e.identifier}`
  let [targetReminder] = reminder_created.filter(e => e.notes != null && e.notes.includes(targetNote))
  if(targetReminder){
    if(targetReminder.isCompleted){
       if(e.title.includes("⭕️")){
        e.title = "✅" + e.title.substr(1)
        e.save()
        }
    }
    targetReminder.title = e.title
    targetReminder.notes = targetNote
    targetReminder.dueDate = e.endDate
    targetReminder.calendar = reminder_map[e.calendar.title]
    targetReminder.dueDateIncludesTime = !e.isAllDay
    targetReminder.save()
  }
  else{
    newReminder = new Reminder()
    newReminder.title = e.title
    newReminder.notes = targetNote
    newReminder.dueDate = e.endDate
    newReminder.calendar = reminder_map[e.calendar.title]
    newReminder.dueDateIncludesTime = !e.isAllDay
    
      if(e.title.includes("✅",0)){
      newReminder.isCompleted = true
    }
    else if(!e.title.includes("⭕️", 0)){
          e.title = "⭕️"+e.title
          e.save()
      }  
      newReminder.save()
  }
})

Script.complete()

