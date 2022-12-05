## Ebrain IoT Freecooling Controller

The controller uses two PID controllers for fan control and an hysteresis
controller for air conditioner control.
```
  ┌───────────┬─────────────────────────────┬─────────┐
  │           ├─────────────────────────────┤         │
  │           │                             │         │
  │           └─────────────────────────────┘         │
  │                   AIR CONDITIONER                 │
  │                                                   │
  │                                                   │
┌─┼─┐                                               ┌─┼─┐
│ │ │                                               │ │ │
│ │ │                                               │ │ │
│ │ │         ┌─┐                        ┌─┐        │ │ │
│ │ │FAN1     │ │                        │ │    FAN2│ │ │
│ │ │         └─┘                        └─┘        │ │ │
│ │ │                                               │ │ │
│ │ │       SENSOR1                    SENSOR2      │ │ │
└─┼─┘                                               └─┼─┘
  │                                                   │
  │                                                   │
  │                       AIR VENT                    │
  │                  ┌─────────────────┐              │
  │                  │┼┼┼┼┼┼┼┼┼┼┼┼┼┼┼┼┼│              │
  └──────────────────┴─────────────────┴──────────────┘
```