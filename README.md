# RiderShield
🌍 Overview

RiderShield is a simple protection system designed for delivery workers. Most delivery partners depend on daily earnings, and factors like heavy rain, extreme heat, or bad air quality can directly reduce how much they earn.

Our idea is to use real-time environmental data and smart logic to detect such situations and automatically provide financial support. 

The goal is to make sure riders don’t have to worry about income loss during difficult conditions.


👤 Target Users

This platform is mainly for delivery partners working with food delivery apps. These users:

•	Earn money on a daily basis

•	Work in unpredictable weather conditions

•	Need affordable and flexible insurance

•	Prefer simple systems that don’t require manual effort


📊 Problem Statement

Delivery workers often lose around 20–30% of their daily income due to:

•	Rain reducing order demand

•	Extreme temperatures limiting working hours

•	Poor air quality affecting health

Right now, there is no proper system that compensates for these losses in real time.


💡 Proposed Solution

RiderShield AI provides a parametric insurance system for gig workers.

Instead of manually applying for claims, the system:

•	Detects difficult conditions automatically

•	Calculates risk using data

•	Triggers payouts instantly

•	This helps riders maintain stable income without extra effort.


⚙️ How It Works

•	The system continuously tracks weather and air quality

•	It calculates a risk score based on environmental conditions

•	Riders pay a small weekly premium

•	When conditions cross certain limits, payouts are triggered automatically

•	Before payout, a verification check is performed


🧠 Risk Model (Simple Explanation)

We calculate a risk score using:

•	Rainfall

•	Temperature

•	Air Quality Index (AQI)

•	Location

This score helps decide how risky the situation is and how pricing should be adjusted.


🌦️ Trigger Conditions

The system provides support when:

•	Rainfall is more than 50 mm/day

•	Temperature exceeds 40°C

•	Air quality reaches unhealthy levels

These conditions usually reduce a rider’s ability to work effectively.


🛡️ Fraud Prevention (Basic Idea)

To keep the system fair, we already check:

•	User location

•	Activity patterns

•	Device usage

•	Unusual behaviour


🚨 Adversarial Defence & Anti-Spoofing Strategy

Recently, we identified a major risk: GPS spoofing attacks, where users fake their location to claim money.

To handle this, we improved our system beyond simple GPS checks.


1️⃣ How We Differentiate Real vs Fake Users

Instead of trusting only location, we look at real-world behaviour.

A genuine rider usually:

•	Moves naturally across routes

•	Has realistic speed changes (traffic, stops, deliveries)

•	Uses the delivery app actively

•	Experiences weather that matches their location

A fake/spoofed user usually:

•	Shows unrealistic or static movement

•	Has no actual delivery activity

•	Claims weather conditions that don’t match real data

•	Shows patterns similar to other suspicious users

We use basic anomaly detection logic to identify such differences.


2️⃣ What Data We Use (Beyond GPS)

To make the system stronger, we check multiple signals:


📱 Device Data

•	Movement from accelerometer

•	Phone orientation and motion

Whether the device is actually moving or not


🌐 Network Data

•	IP address patterns

•	Multiple users using the same network

•	Sudden location jumps


📦 Work Activity

Orders accepted and completed

•	Time spent working vs idle

•	Distance travelled


🌦️ Environmental Matching

•	Compare user location with actual weather data

•	Check consistency with nearby users


👥 Group Fraud Detection

Identify users with:

•	Same claim timing

•	Same location clusters

•	Similar behaviour patterns

•	This helps detect organized fraud groups.


3️⃣ User Experience (UX) Balance

We want to stop fraud without affecting honest users.

So we designed a fair system:


🟢 Low Risk

•	No suspicious activity

•	Instant payout


🟡 Medium Risk

•	Small verification step (like app confirmation or quick check)


🔴 High Risk

•	Claim is temporarily held

•	Reviewed manually

•	User can appeal


🤝 Important Focus

•	No unnecessary blocking

•	Clear communication with users

•	Quick resolution process

•	Trust improves over time for genuine users


🚫 Possible Fraud Cases

•	Fake GPS location

•	Multiple account creation

•	Group-based fake claims

•	Claiming without actually working


🔄 System Workflow

•	User selects a weekly plan

•	System calculates risk and premium

•	Weather and environment are monitored continuously

•	Trigger condition is detected

•	Fraud checks are applied

•	Payout is processed (or flagged if needed)


🏗️ System Architecture (High-Level)

•	Frontend for user interaction

•	Backend for logic and processing

•	Database for storing user and claim data

•	External APIs for weather and air quality

•	AI module for risk and fraud detection


🖥️ Tech Stack

•	Frontend: React.js

•	Backend: Node.js

•	Database: MySQL

•	APIs: Weather + AQI APIs


🚀 Future Improvements

•	Full system implementation

•	Real-time API integration

•	Advanced machine learning models

•	Fully automated claim system
•	Better fraud detection using behaviour analysis

