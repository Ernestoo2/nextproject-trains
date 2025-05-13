import mongoose from "mongoose";
import { Train } from "./Train";
import { TrainClass } from "./TrainClass";
import { Route } from "./Route";
import { Station } from "./Station";
import { User } from "./User";
import { TripType } from "./TripType"; 

// Ensure all models are registered
export { Train, TrainClass, Route, Station, User, TripType };
