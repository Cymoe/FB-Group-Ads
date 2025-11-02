// AI Template Structure with Service Types
// Structure: Industry → Service Type → Goal → Templates

export const aiTemplateStructure = {
  home_services: {
    name: 'Home Services',
    icon: '🏠',
    description: '20+ Service Types: HVAC, Plumbing, Roofing, Electrical, Landscaping, Pest Control & More',
    serviceTypes: {
      hvac: {
        name: 'HVAC',
        icon: '❄️',
        description: 'Heating, Cooling, Air Quality',
        goals: {
          special_offer: {
            name: 'Special Offer',
            templates: [
              { id: 'free_inspection', name: 'Free System Inspection', icon: '🔍', prompt: 'Generate a Facebook post for an HVAC company offering a FREE system inspection. Include: common heating/cooling problems, what the inspection covers (air filter, thermostat, ducts, efficiency check), limited-time urgency, energy savings benefit, booking CTA. Company: {company}' },
              { id: 'seasonal_discount', name: 'Seasonal Tune-Up Discount', icon: '💰', prompt: 'Generate a Facebook post for a limited-time HVAC tune-up discount. Include: percentage off, what\'s included, prevent breakdowns, extend system life, booking deadline. Company: {company}' },
              { id: 'first_time_customer', name: 'First-Time Customer Deal', icon: '🎁', prompt: 'Generate a Facebook post for first-time customer special. Include: service discount, what they get, why choose us, limited spots, new customer CTA. Company: {company}' }
            ]
          },
          value_tips: {
            name: 'Value Tips',
            templates: [
              { id: 'efficiency_tips', name: 'Energy Efficiency Tips', icon: '💡', prompt: 'Generate a Facebook post with HVAC energy efficiency tips. Include: 3-5 actionable tips to lower energy bills, thermostat settings, filter changes, when to upgrade, professional maintenance benefits. Company: {company}' },
              { id: 'seasonal_prep', name: 'Seasonal Preparation Guide', icon: '📅', prompt: 'Generate a Facebook post about preparing HVAC for the season. Include: what homeowners should check, when to schedule service, prevent issues, comfort benefits. Company: {company}' }
            ]
          },
          cost_saver: {
            name: 'Cost Saver',
            templates: [
              { id: 'lower_bills', name: 'Lower Your Energy Bills', icon: '💰', prompt: 'Generate a Facebook post about lowering HVAC energy costs. Include: specific money-saving tactics, programmable thermostat benefits, insulation tips, maintenance savings, estimated cost reductions. Company: {company}' },
              { id: 'prevent_repairs', name: 'Prevent Costly Repairs', icon: '🛠️', prompt: 'Generate a Facebook post about preventing expensive HVAC repairs. Include: maintenance importance, common preventable issues, cost comparison, tune-up CTA. Company: {company}' }
            ]
          },
          quick_tip: {
            name: 'Quick Tip',
            templates: [
              { id: 'filter_change', name: 'Filter Change Reminder', icon: '⚡', prompt: 'Generate a short Facebook post reminding people to change HVAC filters. Include: frequency recommendation, benefits, what happens if you don\'t, where to buy, professional service option. Company: {company}' },
              { id: 'thermostat_setting', name: 'Optimal Thermostat Settings', icon: '🌡️', prompt: 'Generate a brief Facebook post about optimal thermostat settings. Include: recommended temps, programmable settings, sleep mode, savings potential. Company: {company}' }
            ]
          },
          diy_guide: {
            name: 'DIY Guide',
            templates: [
              { id: 'basic_maintenance', name: 'Basic HVAC Maintenance', icon: '🔧', prompt: 'Generate a Facebook post with DIY HVAC maintenance steps. Include: safety first, what homeowners can do themselves, what needs a pro, step-by-step basics, service CTA. Company: {company}' },
              { id: 'troubleshooting', name: 'Simple Troubleshooting', icon: '🔍', prompt: 'Generate a Facebook post with simple HVAC troubleshooting steps. Include: check thermostat, breaker, filter, when to DIY vs call pro, emergency service CTA. Company: {company}' }
            ]
          },
          warning_post: {
            name: 'Warning Post',
            templates: [
              { id: 'warning_signs', name: 'System Warning Signs', icon: '⚠️', prompt: 'Generate a Facebook post about HVAC warning signs. Include: 3-5 signs your system needs attention (strange noises, weak airflow, high bills), what each means, risks of ignoring, urgent service CTA. Company: {company}' },
              { id: 'dangers', name: 'Dangers of Neglect', icon: '🚨', prompt: 'Generate a Facebook post about dangers of neglecting HVAC. Include: fire risks, carbon monoxide, breakdown scenarios, health impacts, inspection CTA. Company: {company}' }
            ]
          },
          personal_story: {
            name: 'Customer Story',
            templates: [
              { id: 'success_story', name: 'Customer Success Story', icon: '⭐', prompt: 'Generate a Facebook post featuring a customer success story. Include: customer problem, how we solved it, results achieved, customer quote, satisfaction emphasis, service CTA. Company: {company}' },
              { id: 'testimonial', name: 'Customer Testimonial', icon: '💬', prompt: 'Generate a Facebook post highlighting customer testimonial. Include: customer name, specific praise, before/after situation, reliability emphasis, review CTA. Company: {company}' }
            ]
          },
          local_alert: {
            name: 'Local Alert',
            templates: [
              { id: 'weather_prep', name: 'Weather Preparation', icon: '🌡️', prompt: 'Generate a Facebook post about preparing for upcoming local weather. Include: heatwave/cold snap mention, system preparation tips, check HVAC now, emergency service availability. Company: {company}' },
              { id: 'seasonal_reminder', name: 'Seasonal Reminder', icon: '📅', prompt: 'Generate a Facebook post with seasonal HVAC reminder. Include: time to switch heating/cooling mode, maintenance timing, local weather reference, booking CTA. Company: {company}' }
            ]
          },
          newsletter: {
            name: 'Newsletter Promo',
            templates: [
              { id: 'monthly_tips', name: 'Monthly Tips Newsletter', icon: '📧', prompt: 'Generate a Facebook post promoting email newsletter signup. Include: what subscribers get (tips, deals, reminders), exclusive offers, helpful content, signup CTA. Company: {company}' },
              { id: 'seasonal_guide', name: 'Free Seasonal Guide', icon: '📖', prompt: 'Generate a Facebook post offering free HVAC seasonal guide via email. Include: what\'s in the guide, value prop, email signup CTA. Company: {company}' }
            ]
          },
          social_proof: {
            name: 'Social Proof',
            templates: [
              { id: 'review_showcase', name: 'Customer Reviews', icon: '⭐', prompt: 'Generate a Facebook post showcasing multiple customer reviews. Include: 2-3 short review quotes, star ratings, years in business, local trust, review us CTA. Company: {company}' },
              { id: 'milestone', name: 'Business Milestone', icon: '🎉', prompt: 'Generate a Facebook post celebrating business milestone. Include: years in business, customers served, thank you message, commitment to quality, service CTA. Company: {company}' }
            ]
          }
        }
      },
      plumbing: {
        name: 'Plumbing',
        icon: '🚰',
        description: 'Pipes, Drains, Water Heaters',
        goals: {
          special_offer: { name: 'Special Offer', templates: [
            { id: 'free_inspection', name: 'Free Plumbing Inspection', icon: '🔍', prompt: 'Generate a Facebook post for a plumbing company offering a FREE inspection. Include: common plumbing problems (leaks, clogs, pressure), what the inspection covers, prevent water damage message, booking CTA. Company: {company}' },
            { id: 'drain_special', name: 'Drain Cleaning Special', icon: '💧', prompt: 'Generate a Facebook post for drain cleaning special pricing. Include: signs of clogs, health risks, package details, prevent major issues, booking CTA. Company: {company}' }
          ]},
          value_tips: { name: 'Value Tips', templates: [
            { id: 'prevent_clogs', name: 'Prevent Drain Clogs', icon: '💡', prompt: 'Generate a Facebook post about preventing drain clogs. Include: what NOT to put down drains, simple maintenance tips, signs of trouble, when to call a pro. Company: {company}' },
            { id: 'water_heater_care', name: 'Water Heater Care', icon: '🔥', prompt: 'Generate a Facebook post about water heater maintenance. Include: flush schedule, temperature settings, lifespan tips, warning signs. Company: {company}' }
          ]},
          cost_saver: { name: 'Cost Saver', templates: [
            { id: 'prevent_leaks', name: 'Prevent Costly Leaks', icon: '💰', prompt: 'Generate a Facebook post about preventing expensive water damage. Include: leak detection tips, early warning signs, inspection benefits, cost comparison. Company: {company}' },
            { id: 'water_savings', name: 'Water Bill Savings', icon: '💧', prompt: 'Generate a Facebook post about reducing water bills. Include: fix leaks, efficient fixtures, water-saving tips, estimated savings. Company: {company}' }
          ]},
          quick_tip: { name: 'Quick Tip', templates: [
            { id: 'shutoff_valve', name: 'Know Your Shut-Off Valve', icon: '⚡', prompt: 'Generate a short Facebook post about locating main water shut-off. Include: why it matters, where to find it, label it, emergency importance. Company: {company}' },
            { id: 'frozen_pipes', name: 'Prevent Frozen Pipes', icon: '❄️', prompt: 'Generate a brief Facebook post about preventing frozen pipes. Include: insulation, dripping faucets, cabinet doors, emergency service. Company: {company}' }
          ]},
          diy_guide: { name: 'DIY Guide', templates: [
            { id: 'unclog_drain', name: 'DIY Drain Unclogging', icon: '🔧', prompt: 'Generate a Facebook post with DIY drain unclogging methods. Include: plunger technique, natural solutions, when to stop trying, call pro when needed. Company: {company}' },
            { id: 'fix_running_toilet', name: 'Fix a Running Toilet', icon: '🚽', prompt: 'Generate a Facebook post with steps to fix a running toilet. Include: common causes, simple fixes, parts needed, when to call expert. Company: {company}' }
          ]},
          warning_post: { name: 'Warning Post', templates: [
            { id: 'emergency_tips', name: 'Pipe Burst Emergency', icon: '⚠️', prompt: 'Generate a Facebook post with emergency plumbing tips. Include: what to do when pipes burst, shut-off valve location, temporary fixes, call immediately, 24/7 availability. Company: {company}' },
            { id: 'water_damage', name: 'Water Damage Dangers', icon: '🚨', prompt: 'Generate a Facebook post about water damage risks. Include: mold growth, structural damage, health hazards, prevention tips, inspection CTA. Company: {company}' }
          ]},
          personal_story: { name: 'Customer Story', templates: [
            { id: 'saved_home', name: 'We Saved This Home', icon: '⭐', prompt: 'Generate a Facebook post about preventing major water damage. Include: customer situation, how we helped, disaster averted, customer relief, inspection offer. Company: {company}' },
            { id: 'testimonial', name: 'Customer Testimonial', icon: '💬', prompt: 'Generate a Facebook post with customer testimonial. Include: emergency situation, fast response, problem solved, customer quote, 24/7 service emphasis. Company: {company}' }
          ]},
          local_alert: { name: 'Local Alert', templates: [
            { id: 'freeze_warning', name: 'Freeze Warning', icon: '🌡️', prompt: 'Generate a Facebook post about local freeze warning. Include: protect pipes now, prevention steps, emergency service ready, call before it\'s too late. Company: {company}' },
            { id: 'seasonal_check', name: 'Seasonal Plumbing Check', icon: '📅', prompt: 'Generate a Facebook post about seasonal plumbing maintenance. Include: season-specific issues, preventive inspection, avoid surprises, booking CTA. Company: {company}' }
          ]},
          newsletter: { name: 'Newsletter Promo', templates: [
            { id: 'maintenance_tips', name: 'Monthly Maintenance Tips', icon: '📧', prompt: 'Generate a Facebook post promoting plumbing newsletter. Include: monthly tips, seasonal reminders, exclusive discounts, signup CTA. Company: {company}' }
          ]},
          social_proof: { name: 'Social Proof', templates: [
            { id: 'five_star_reviews', name: 'Five-Star Reviews', icon: '⭐', prompt: 'Generate a Facebook post showcasing 5-star reviews. Include: multiple customer quotes, emergency response praise, reliability, review us CTA. Company: {company}' },
            { id: 'years_serving', name: 'Years Serving Community', icon: '🎉', prompt: 'Generate a Facebook post celebrating years in business. Include: homes served, trust built, commitment continues, thank you, service CTA. Company: {company}' }
          ]}
        }
      },
      roofing: {
        name: 'Roofing',
        icon: '🏠',
        description: 'Roof Repair, Replacement, Inspection',
        goals: {
          special_offer: { name: '🎁 Special Offer', templates: [
            { id: 'free_inspection', name: 'Free Roof Inspection', icon: '🔍', prompt: 'Generate a Facebook post for a roofing company offering a FREE inspection. Include: storm damage concerns, what inspection covers, catch problems early, insurance claim assistance, booking CTA. Company: {company}' },
            { id: 'storm_special', name: 'Post-Storm Discount', icon: '⛈️', prompt: 'Generate a Facebook post for post-storm repair discount. Include: damage assessment, insurance help, limited time, protect your home, booking CTA. Company: {company}' }
          ]},
          value_tips: { name: '💡 Value Tips', templates: [
            { id: 'maintenance_tips', name: 'Roof Maintenance Tips', icon: '🔧', prompt: 'Generate a Facebook post with roof maintenance tips. Include: gutter cleaning, trim trees, inspect regularly, extend roof life, professional inspection benefits. Company: {company}' },
            { id: 'seasonal_care', name: 'Seasonal Roof Care', icon: '🍂', prompt: 'Generate a Facebook post about seasonal roof maintenance. Include: what to check, prevent damage, timing importance, inspection offer. Company: {company}' },
            { id: 'ventilation_importance', name: 'Proper Roof Ventilation', icon: '💨', prompt: 'Generate a Facebook post about roof ventilation importance. Include: prevent moisture buildup, extend shingle life, reduce energy costs, attic temperature control, signs of poor ventilation. Company: {company}' },
            { id: 'gutter_maintenance', name: 'Gutter Maintenance Guide', icon: '🌧️', prompt: 'Generate a Facebook post about gutter maintenance. Include: cleaning frequency, prevent water damage, overflow prevention, downspout care, when to replace. Company: {company}' },
            { id: 'shingle_inspection', name: 'Inspect Your Shingles', icon: '🔍', prompt: 'Generate a Facebook post about shingle inspection tips. Include: what to look for, missing or damaged shingles, curling edges, granule loss, when to call a pro. Company: {company}' },
            { id: 'prevent_ice_dams', name: 'Prevent Ice Dams', icon: '❄️', prompt: 'Generate a Facebook post about preventing ice dams on roofs. Include: proper insulation, ventilation, roof raking tips, danger signs, professional solutions. Company: {company}' },
            { id: 'extend_roof_life', name: 'Extend Your Roof Life', icon: '⏳', prompt: 'Generate a Facebook post with tips to extend roof lifespan. Include: regular maintenance schedule, professional inspections, immediate repairs, material care, cost savings. Company: {company}' },
            { id: 'attic_ventilation_tips', name: 'Attic Ventilation Tips', icon: '🏠', prompt: 'Generate a Facebook post about attic ventilation for roof health. Include: prevent mold, reduce heat, lower energy bills, extend roof life, proper airflow. Company: {company}' },
            { id: 'flashing_importance', name: 'Flashing Maintenance', icon: '⚡', prompt: 'Generate a Facebook post about roof flashing importance. Include: what flashing protects, common problem areas (chimney, vents, valleys), signs of damage, prevent leaks, inspection need. Company: {company}' },
            { id: 'chimney_maintenance', name: 'Chimney & Roof Connection', icon: '🏗️', prompt: 'Generate a Facebook post about chimney roof connection maintenance. Include: flashing around chimney, sealant importance, prevent leaks, inspect regularly, professional repair. Company: {company}' },
            { id: 'moss_algae_prevention', name: 'Prevent Moss & Algae Growth', icon: '🌿', prompt: 'Generate a Facebook post about preventing moss and algae on roofs. Include: causes, damage risks, removal methods, prevention tips, professional cleaning services. Company: {company}' },
            { id: 'tree_branch_clearance', name: 'Tree Branch Clearance', icon: '🌳', prompt: 'Generate a Facebook post about keeping trees away from roof. Include: damage risks, scrape marks, debris buildup, ideal clearance distance, trimming importance. Company: {company}' },
            { id: 'roof_material_selection', name: 'Choosing Roof Materials', icon: '🏗️', prompt: 'Generate a Facebook post about selecting the right roof material. Include: climate considerations, longevity factors, energy efficiency, cost vs value, consultation offer. Company: {company}' },
            { id: 'skylight_care', name: 'Skylight Maintenance', icon: '☀️', prompt: 'Generate a Facebook post about skylight roof care. Include: seal maintenance, leak prevention, cleaning tips, weather sealing, professional inspection. Company: {company}' },
            { id: 'energy_efficient_roofing', name: 'Energy Efficient Roofing', icon: '⚡', prompt: 'Generate a Facebook post about energy-efficient roofing benefits. Include: reflect heat, lower cooling costs, color choices, insulation importance, savings potential. Company: {company}' },
            { id: 'roof_warranty_tips', name: 'Protecting Your Roof Warranty', icon: '📋', prompt: 'Generate a Facebook post about maintaining roof warranty. Include: required maintenance, professional inspections, documentation, warranty coverage, expert care importance. Company: {company}' },
            { id: 'roof_age_assessment', name: 'Know Your Roof Age', icon: '📅', prompt: 'Generate a Facebook post about understanding roof age. Include: typical lifespan by material, signs of aging, when to plan replacement, inspection timing, proactive planning benefits. Company: {company}' },
            { id: 'insurance_claim_guide', name: 'Roof Damage Insurance Guide', icon: '📄', prompt: 'Generate a Facebook post about navigating roof damage insurance claims. Include: documentation tips, what insurance covers, claim process, professional assessment value, assistance offer. Company: {company}' }
          ]},
          cost_saver: { name: '💰 Cost Saver', templates: [
            { id: 'catch_early', name: 'Catch Problems Early', icon: '👀', prompt: 'Generate a Facebook post about catching roof problems early. Include: small fixes vs full replacement, cost comparison, inspection value, prevent major expense. Company: {company}' },
            { id: 'extend_life', name: 'Extend Roof Lifespan', icon: '⏰', prompt: 'Generate a Facebook post about extending roof life. Include: maintenance benefits, cost savings, years added, professional care value. Company: {company}' }
          ]},
          quick_tip: { name: '⚡ Quick Tip', templates: [
            { id: 'after_storm', name: 'Inspect After Storms', icon: '🌩️', prompt: 'Generate a brief Facebook post about inspecting roof after storms. Include: what to look for, document damage, call professional, insurance claims. Company: {company}' },
            { id: 'attic_check', name: 'Check Your Attic', icon: '🏠', prompt: 'Generate a short Facebook post about attic leak detection. Include: water stains, daylight through roof, call immediately. Company: {company}' }
          ]},
          diy_guide: { name: '🔨 DIY Guide', templates: [
            { id: 'spot_damage', name: 'Spot Roof Damage', icon: '👁️', prompt: 'Generate a Facebook post teaching homeowners to spot roof damage. Include: what to look for from ground, binoculars help, never climb yourself, call pro for inspection. Company: {company}' }
          ]},
          warning_post: { name: '⚠️ Warning Post', templates: [
            { id: 'replacement_signs', name: 'Roof Replacement Signs', icon: '🚨', prompt: 'Generate a Facebook post about signs you need a new roof. Include: age of roof, missing shingles, leaks, curling, when to repair vs replace, urgent inspection offer. Company: {company}' },
            { id: 'ignore_danger', name: 'Dangers of Waiting', icon: '☔', prompt: 'Generate a Facebook post about dangers of ignoring roof problems. Include: water damage, mold, structural issues, costs multiply, act now. Company: {company}' }
          ]},
          personal_story: { name: '⭐ Customer Story', templates: [
            { id: 'saved_interior', name: 'Saved Their Home Interior', icon: '🏡', prompt: 'Generate a Facebook post about preventing interior damage. Include: customer caught it early, roof fixed, avoided disaster, customer relief, inspection CTA. Company: {company}' }
          ]},
          local_alert: { name: '📍 Local Alert', templates: [
            { id: 'storm_coming', name: 'Storm Preparation', icon: '🌪️', prompt: 'Generate a Facebook post about upcoming storm preparation. Include: check roof now, secure loose shingles, prevent damage, emergency service ready. Company: {company}' },
            { id: 'hail_season', name: 'Hail Season Alert', icon: '🧊', prompt: 'Generate a Facebook post about hail season. Include: inspect for damage, insurance claims, free assessment, act fast. Company: {company}' }
          ]},
          newsletter: { name: '📧 Newsletter Promo', templates: [
            { id: 'roof_care_tips', name: 'Roof Care Newsletter', icon: '📬', prompt: 'Generate a Facebook post promoting roofing newsletter. Include: seasonal tips, storm alerts, maintenance reminders, signup CTA. Company: {company}' }
          ]},
          social_proof: { name: '🏆 Social Proof', templates: [
            { id: 'insurance_trusted', name: 'Insurance Trusted', icon: '🤝', prompt: 'Generate a Facebook post about insurance company trust. Include: preferred contractor, claims expertise, homeowner relief, consultation CTA. Company: {company}' },
            { id: 'roofs_completed', name: 'Roofs We\'ve Completed', icon: '✅', prompt: 'Generate a Facebook post celebrating roofs completed. Include: number of homes, quality commitment, local trust, estimate CTA. Company: {company}' }
          ]}
        }
      },
      electrical: {
        name: 'Electrical',
        icon: '⚡',
        description: 'Wiring, Lighting, Panels, Safety',
        goals: {
          special_offer: { name: '🎁 Special Offer', templates: [
            { id: 'free_inspection', name: 'Free Safety Inspection', icon: '🔍', prompt: 'Generate a Facebook post for a free electrical safety inspection. Include: electrical fire risks, what inspection covers (outlets, panel, wiring), peace of mind benefit, booking CTA. Company: {company}' },
            { id: 'panel_discount', name: 'Panel Upgrade Special', icon: '📦', prompt: 'Generate a Facebook post for electrical panel upgrade discount. Include: modern demands, safety upgrade, limited time pricing, booking CTA. Company: {company}' }
          ]},
          value_tips: { name: '💡 Value Tips', templates: [
            { id: 'energy_savings', name: 'Energy Saving Tips', icon: '💰', prompt: 'Generate a Facebook post about electrical energy savings. Include: LED upgrades, smart switches, phantom loads, monthly savings potential. Company: {company}' },
            { id: 'outlet_safety', name: 'Outlet Safety Basics', icon: '🔌', prompt: 'Generate a Facebook post about outlet safety. Include: GFCI outlets, overloading prevention, childproofing, when to upgrade. Company: {company}' }
          ]},
          cost_saver: { name: '💰 Cost Saver', templates: [
            { id: 'prevent_fires', name: 'Prevent Electrical Fires', icon: '🔥', prompt: 'Generate a Facebook post about preventing electrical fires. Include: inspection value, old wiring risks, cost of fire damage vs prevention, safety first. Company: {company}' }
          ]},
          quick_tip: { name: '⚡ Quick Tip', templates: [
            { id: 'breaker_box', name: 'Know Your Breaker Box', icon: '📍', prompt: 'Generate a brief Facebook post about knowing your breaker box location. Include: label all breakers, emergency importance, test GFCI monthly. Company: {company}' },
            { id: 'surge_protection', name: 'Surge Protection', icon: '⚡', prompt: 'Generate a short Facebook post about surge protectors. Include: protect expensive electronics, whole-home options, inspection offer. Company: {company}' }
          ]},
          diy_guide: { name: '🔨 DIY Guide', templates: [
            { id: 'breaker_reset', name: 'Reset a Tripped Breaker', icon: '🔧', prompt: 'Generate a Facebook post with steps to reset breaker. Include: find breaker box, turn off then on, when to call pro, safety warning. Company: {company}' }
          ]},
          warning_post: { name: '⚠️ Warning Post', templates: [
            { id: 'danger_signs', name: 'Electrical Danger Signs', icon: '🚨', prompt: 'Generate a Facebook post about electrical danger signs. Include: flickering lights, burning smells, hot outlets, tripping breakers, call immediately. Company: {company}' },
            { id: 'diy_dangers', name: 'Never DIY Electrical', icon: '⛔', prompt: 'Generate a Facebook post about dangers of DIY electrical work. Include: shock risks, fire hazards, code violations, always hire licensed pro. Company: {company}' }
          ]},
          personal_story: { name: '⭐ Customer Story', templates: [
            { id: 'prevented_fire', name: 'Prevented a Fire', icon: '🔥', prompt: 'Generate a Facebook post about preventing electrical fire. Include: inspection caught hazard, customer relief, disaster avoided, safety emphasis. Company: {company}' }
          ]},
          local_alert: { name: '📍 Local Alert', templates: [
            { id: 'storm_surge', name: 'Storm Surge Alert', icon: '🌩️', prompt: 'Generate a Facebook post about storm surge protection. Include: unplug electronics, surge protector importance, whole-home options, service ready. Company: {company}' }
          ]},
          newsletter: { name: '📧 Newsletter Promo', templates: [
            { id: 'safety_tips', name: 'Electrical Safety Newsletter', icon: '📬', prompt: 'Generate a Facebook post promoting electrical safety newsletter. Include: monthly safety tips, energy savings, code updates, signup CTA. Company: {company}' }
          ]},
          social_proof: { name: '🏆 Social Proof', templates: [
            { id: 'licensed_insured', name: 'Licensed & Insured', icon: '✅', prompt: 'Generate a Facebook post about licensing and insurance. Include: master electrician, code compliant, insurance protection, trust badges, service CTA. Company: {company}' }
          ]}
        }
      },
      landscaping: {
        name: 'Landscaping',
        icon: '🌱',
        description: 'Lawn Care, Design, Maintenance',
        goals: {
          special_offer: { name: '🎁 Special Offer', templates: [
            { id: 'free_estimate', name: 'Free Lawn Estimate', icon: '🔍', prompt: 'Generate a Facebook post offering FREE landscaping estimates. Include: lawn health assessment, design consultation, what\'s included, spring/summer prep, booking CTA. Company: {company}' },
            { id: 'seasonal_special', name: 'Seasonal Cleanup Special', icon: '🍂', prompt: 'Generate a Facebook post for seasonal yard cleanup discount. Include: fall/spring needs, debris removal, mulching, special pricing, booking CTA. Company: {company}' }
          ]},
          value_tips: { name: '💡 Value Tips', templates: [
            { id: 'lawn_care', name: 'Lawn Care Tips', icon: '🌿', prompt: 'Generate a Facebook post with lawn care tips. Include: watering schedule, mowing height, fertilization timing, weed prevention, when to call a pro. Company: {company}' },
            { id: 'seasonal_guide', name: 'Seasonal Lawn Guide', icon: '📅', prompt: 'Generate a Facebook post about seasonal lawn care. Include: what to do each season, timing for treatments, prepare for weather changes, professional service benefits. Company: {company}' }
          ]},
          cost_saver: { name: '💰 Cost Saver', templates: [
            { id: 'prevent_problems', name: 'Prevent Lawn Problems', icon: '🌱', prompt: 'Generate a Facebook post about preventing costly lawn issues. Include: early treatment, avoid resodding, cost comparison, maintenance value. Company: {company}' }
          ]},
          quick_tip: { name: '⚡ Quick Tip', templates: [
            { id: 'watering', name: 'Watering Schedule', icon: '💧', prompt: 'Generate a brief Facebook post about optimal watering. Include: best time of day, deep vs frequent, water conservation, results. Company: {company}' }
          ]},
          diy_guide: { name: '🔨 DIY Guide', templates: [
            { id: 'basic_mowing', name: 'Proper Mowing Height', icon: '🔧', prompt: 'Generate a Facebook post with mowing tips. Include: blade height by season, never cut more than 1/3, sharp blades, professional care option. Company: {company}' }
          ]},
          warning_post: { name: '⚠️ Warning Post', templates: [
            { id: 'disease_signs', name: 'Lawn Disease Warning', icon: '🚨', prompt: 'Generate a Facebook post about lawn disease signs. Include: brown patches, fungus, act fast, treatment options, call now. Company: {company}' }
          ]},
          personal_story: { name: '⭐ Customer Story', templates: [
            { id: 'transformation', name: 'Lawn Transformation', icon: '🌟', prompt: 'Generate a Facebook post about lawn transformation. Include: before state, treatment plan, stunning results, customer satisfaction, estimate offer. Company: {company}' }
          ]},
          local_alert: { name: '📍 Local Alert', templates: [
            { id: 'weather_prep', name: 'Weather Preparation', icon: '🌦️', prompt: 'Generate a Facebook post about preparing lawn for weather. Include: upcoming conditions, protection steps, service ready, booking CTA. Company: {company}' }
          ]},
          newsletter: { name: '📧 Newsletter Promo', templates: [
            { id: 'lawn_tips', name: 'Monthly Lawn Tips', icon: '📬', prompt: 'Generate a Facebook post promoting lawn care newsletter. Include: seasonal tips, treatment reminders, exclusive offers, signup CTA. Company: {company}' }
          ]},
          social_proof: { name: '🏆 Social Proof', templates: [
            { id: 'yards_maintained', name: 'Yards Maintained', icon: '🏡', prompt: 'Generate a Facebook post celebrating yards maintained. Include: local presence, quality commitment, neighborhood trust, service CTA. Company: {company}' }
          ]}
        }
      },
      pest_control: {
        name: 'Pest Control',
        icon: '🐜',
        description: 'Insects, Rodents, Termites',
        goals: {
          special_offer: { name: '🎁 Special Offer', templates: [
            { id: 'free_inspection', name: 'Free Pest Inspection', icon: '🔍', prompt: 'Generate a Facebook post for FREE pest inspection. Include: common pests in area, what inspection covers, prevent infestations, family-safe treatments, booking CTA. Company: {company}' },
            { id: 'first_treatment', name: 'First Treatment Discount', icon: '💰', prompt: 'Generate a Facebook post for first treatment discount. Include: eco-friendly options, what\'s included, guarantee, special pricing, booking CTA. Company: {company}' }
          ]},
          value_tips: { name: '💡 Value Tips', templates: [
            { id: 'prevention', name: 'Pest Prevention Tips', icon: '🚫', prompt: 'Generate a Facebook post with pest prevention tips. Include: sealing entry points, food storage, moisture control, yard maintenance, signs of infestation. Company: {company}' },
            { id: 'seasonal_prep', name: 'Seasonal Pest Prep', icon: '📅', prompt: 'Generate a Facebook post about seasonal pest prevention. Include: what pests are active when, preparation steps, preventive treatments. Company: {company}' }
          ]},
          cost_saver: { name: '💰 Cost Saver', templates: [
            { id: 'prevent_damage', name: 'Prevent Termite Damage', icon: '🏠', prompt: 'Generate a Facebook post about preventing termite damage. Include: inspection value, damage costs vs prevention, home protection, annual plans. Company: {company}' }
          ]},
          quick_tip: { name: '⚡ Quick Tip', templates: [
            { id: 'entry_points', name: 'Seal Entry Points', icon: '🔒', prompt: 'Generate a brief Facebook post about sealing pest entry points. Include: check windows/doors, caulk cracks, inspect foundation, service option. Company: {company}' }
          ]},
          diy_guide: { name: '🔨 DIY Guide', templates: [
            { id: 'identify_pests', name: 'Identify Common Pests', icon: '🔎', prompt: 'Generate a Facebook post helping identify common household pests. Include: 3-4 common pests, signs of each, risks they pose, when to call professional. Company: {company}' }
          ]},
          warning_post: { name: '⚠️ Warning Post', templates: [
            { id: 'termite_warning', name: 'Termite Warning Signs', icon: '🚨', prompt: 'Generate a Facebook post about termite warning signs. Include: mud tubes, wood damage, swarmers, structural risks, urgent inspection CTA. Company: {company}' },
            { id: 'health_risks', name: 'Pest Health Risks', icon: '⚕️', prompt: 'Generate a Facebook post about pest health risks. Include: disease carriers, allergens, contamination, family safety, treatment CTA. Company: {company}' }
          ]},
          personal_story: { name: '⭐ Customer Story', templates: [
            { id: 'saved_home', name: 'Saved From Termites', icon: '🏡', prompt: 'Generate a Facebook post about preventing termite damage. Include: customer situation, inspection findings, treatment success, home saved, inspection offer. Company: {company}' }
          ]},
          local_alert: { name: '📍 Local Alert', templates: [
            { id: 'season_active', name: 'Pest Season Alert', icon: '🐛', prompt: 'Generate a Facebook post about active pest season. Include: which pests are emerging, prepare now, preventive treatment, booking CTA. Company: {company}' }
          ]},
          newsletter: { name: '📧 Newsletter Promo', templates: [
            { id: 'pest_alerts', name: 'Pest Alert Newsletter', icon: '📬', prompt: 'Generate a Facebook post promoting pest control newsletter. Include: seasonal alerts, prevention tips, special offers, signup CTA. Company: {company}' }
          ]},
          social_proof: { name: '🏆 Social Proof', templates: [
            { id: 'homes_protected', name: 'Homes Protected', icon: '🛡️', prompt: 'Generate a Facebook post about homes protected. Include: years in business, customer satisfaction, local trust, service CTA. Company: {company}' }
          ]}
        }
      },
      house_cleaning: {
        name: 'House Cleaning',
        icon: '🧹',
        description: 'Maid Service, Deep Cleaning',
        goals: {
          special_offer: { name: '🎁 Special Offer', templates: [
            { id: 'first_clean', name: 'First Clean Discount', icon: '💰', prompt: 'Generate a Facebook post for first-time cleaning discount. Include: what\'s included in cleaning, bonded and insured, satisfaction guarantee, discount details, booking CTA. Company: {company}' },
            { id: 'deep_clean', name: 'Deep Clean Special', icon: '✨', prompt: 'Generate a Facebook post for deep cleaning special. Include: what deep clean covers, perfect for spring/move-in, room-by-room details, special pricing, booking CTA. Company: {company}' }
          ]},
          value_tips: { name: '💡 Value Tips', templates: [
            { id: 'cleaning_tips', name: 'Quick Cleaning Tips', icon: '🧽', prompt: 'Generate a Facebook post with quick cleaning tips. Include: 3-5 time-saving tips, daily routines, product recommendations, when to hire professionals. Company: {company}' },
            { id: 'spring_checklist', name: 'Spring Cleaning Checklist', icon: '🌸', prompt: 'Generate a Facebook post with spring cleaning checklist. Include: room-by-room tasks, decluttering tips, deep clean areas, professional help benefits. Company: {company}' }
          ]},
          cost_saver: { name: '💰 Cost Saver', templates: [
            { id: 'save_time', name: 'Save Your Time', icon: '⏰', prompt: 'Generate a Facebook post about time savings with cleaning service. Include: hours saved, stress reduction, value of time, affordable rates. Company: {company}' }
          ]},
          quick_tip: { name: '⚡ Quick Tip', templates: [
            { id: 'daily_routine', name: 'Daily 10-Minute Routine', icon: '🕒', prompt: 'Generate a brief Facebook post about daily cleaning routine. Include: quick tasks, maintain cleanliness, when to schedule deep clean. Company: {company}' }
          ]},
          diy_guide: { name: '🔨 DIY Guide', templates: [
            { id: 'natural_cleaners', name: 'Natural Cleaning Solutions', icon: '🌿', prompt: 'Generate a Facebook post about natural cleaning solutions. Include: vinegar, baking soda uses, eco-friendly tips, professional eco-options. Company: {company}' }
          ]},
          warning_post: { name: '⚠️ Warning Post', templates: [
            { id: 'chemical_dangers', name: 'DIY Chemical Dangers', icon: '☣️', prompt: 'Generate a Facebook post about DIY cleaning dangers. Include: chemical mixing risks, ventilation importance, professional products, safe alternatives. Company: {company}' }
          ]},
          personal_story: { name: '⭐ Customer Story', templates: [
            { id: 'life_changed', name: 'Life-Changing Service', icon: '💖', prompt: 'Generate a Facebook post about how cleaning service changed customer\'s life. Include: busy schedule, stress relief, sparkling home, customer quote, service CTA. Company: {company}' }
          ]},
          local_alert: { name: '📍 Local Alert', templates: [
            { id: 'spring_booking', name: 'Spring Booking Rush', icon: '🌼', prompt: 'Generate a Facebook post about spring cleaning season. Include: book early, limited spots, popular time, scheduling CTA. Company: {company}' }
          ]},
          newsletter: { name: '📧 Newsletter Promo', templates: [
            { id: 'cleaning_secrets', name: 'Cleaning Secrets Newsletter', icon: '📬', prompt: 'Generate a Facebook post promoting cleaning newsletter. Include: pro tips, product recommendations, exclusive discounts, signup CTA. Company: {company}' }
          ]},
          social_proof: { name: '🏆 Social Proof', templates: [
            { id: 'happy_customers', name: 'Happy Customers', icon: '😊', prompt: 'Generate a Facebook post showcasing satisfied customers. Include: testimonials, before/after satisfaction, trust earned, booking CTA. Company: {company}' }
          ]}
        }
      },
      handyman: {
        name: 'Handyman',
        icon: '🔨',
        description: 'General Repairs, Odd Jobs',
        goals: {
          special_offer: { name: '🎁 Special Offer', templates: [
            { id: 'honey_do', name: 'Honey-Do List Special', icon: '📝', prompt: 'Generate a Facebook post for handyman honey-do list service. Include: common household repairs, no job too small, fix-it list relief, affordable rates, booking CTA. Company: {company}' },
            { id: 'maintenance_package', name: 'Maintenance Package', icon: '🏠', prompt: 'Generate a Facebook post for home maintenance package. Include: seasonal tasks, prevent major repairs, package details, peace of mind, booking CTA. Company: {company}' }
          ]},
          value_tips: { name: '💡 Value Tips', templates: [
            { id: 'home_maintenance', name: 'Home Maintenance Checklist', icon: '✅', prompt: 'Generate a Facebook post with home maintenance checklist. Include: monthly/seasonal tasks, catch problems early, extend home life, professional service option. Company: {company}' }
          ]},
          cost_saver: { name: '💰 Cost Saver', templates: [
            { id: 'prevent_major', name: 'Prevent Major Repairs', icon: '🛠️', prompt: 'Generate a Facebook post about preventing major home repairs. Include: small fixes now vs big repairs later, cost comparison, maintenance value. Company: {company}' }
          ]},
          quick_tip: { name: '⚡ Quick Tip', templates: [
            { id: 'same_day', name: 'Same-Day Service Available', icon: '⏰', prompt: 'Generate a brief Facebook post about same-day handyman service. Include: urgent repair needs, fast response, skilled professionals, booking CTA. Company: {company}' }
          ]},
          diy_guide: { name: '🔨 DIY Guide', templates: [
            { id: 'diy_vs_pro', name: 'DIY vs Professional', icon: '🤔', prompt: 'Generate a Facebook post about when to DIY vs hire a pro. Include: simple DIY tasks, when to call professional, safety concerns, cost comparison. Company: {company}' }
          ]},
          warning_post: { name: '⚠️ Warning Post', templates: [
            { id: 'diy_dangers', name: 'DIY Dangers', icon: '🚨', prompt: 'Generate a Facebook post about DIY repair dangers. Include: safety risks, code violations, insurance issues, when to call professional. Company: {company}' }
          ]},
          personal_story: { name: '⭐ Customer Story', templates: [
            { id: 'solved_list', name: 'Solved the Whole List', icon: '✅', prompt: 'Generate a Facebook post about completing customer\'s entire fix-it list. Include: customer relief, tasks completed, efficiency, satisfaction, service CTA. Company: {company}' }
          ]},
          local_alert: { name: '📍 Local Alert', templates: [
            { id: 'weather_prep', name: 'Weather Prep Help', icon: '🌦️', prompt: 'Generate a Facebook post about home prep for upcoming weather. Include: tasks to do, prevent damage, service availability, booking CTA. Company: {company}' }
          ]},
          newsletter: { name: '📧 Newsletter Promo', templates: [
            { id: 'home_tips', name: 'Home Tips Newsletter', icon: '📬', prompt: 'Generate a Facebook post promoting handyman newsletter. Include: seasonal tips, DIY vs pro advice, exclusive deals, signup CTA. Company: {company}' }
          ]},
          social_proof: { name: '🏆 Social Proof', templates: [
            { id: 'projects_completed', name: 'Projects Completed', icon: '🔨', prompt: 'Generate a Facebook post about projects completed. Include: no job too small, customer satisfaction, local trust, service CTA. Company: {company}' }
          ]}
        }
      },
      pool_service: {
        name: 'Pool Services',
        icon: '🏊',
        description: 'Cleaning, Maintenance, Repair',
        goals: {
          special_offer: { name: '🎁 Special Offer', templates: [
            { id: 'opening_special', name: 'Pool Opening Special', icon: '🌞', prompt: 'Generate a Facebook post for pool opening service special. Include: spring opening checklist, equipment inspection, water balancing, ready for summer, booking CTA. Company: {company}' },
            { id: 'maintenance_plan', name: 'Weekly Maintenance Plan', icon: '📅', prompt: 'Generate a Facebook post for weekly pool maintenance plans. Include: what\'s included, crystal clear water, equipment monitoring, hassle-free summer, booking CTA. Company: {company}' }
          ]},
          value_tips: { name: '💡 Value Tips', templates: [
            { id: 'pool_care', name: 'Pool Care Tips', icon: '🏊', prompt: 'Generate a Facebook post with pool care tips. Include: water chemistry basics, cleaning frequency, equipment checks, common mistakes, when to call pro. Company: {company}' },
            { id: 'winterize', name: 'Winterization Guide', icon: '❄️', prompt: 'Generate a Facebook post about pool winterization. Include: why winterize, steps involved, prevent freeze damage, professional service benefits. Company: {company}' }
          ]},
          cost_saver: { name: '💰 Cost Saver', templates: [
            { id: 'prevent_damage', name: 'Prevent Equipment Damage', icon: '🔧', prompt: 'Generate a Facebook post about preventing pool equipment damage. Include: maintenance value, repair costs vs prevention, extend equipment life. Company: {company}' }
          ]},
          quick_tip: { name: '⚡ Quick Tip', templates: [
            { id: 'chemical_balance', name: 'Chemical Balance Basics', icon: '⚗️', prompt: 'Generate a brief Facebook post about pool chemical balance. Include: pH importance, test frequency, when to call pro. Company: {company}' }
          ]},
          diy_guide: { name: '🔨 DIY Guide', templates: [
            { id: 'basic_cleaning', name: 'Basic Pool Cleaning', icon: '🧹', prompt: 'Generate a Facebook post with DIY pool cleaning steps. Include: skimming, vacuuming, filter cleaning, when to call professional. Company: {company}' }
          ]},
          warning_post: { name: '⚠️ Warning Post', templates: [
            { id: 'equipment_warning', name: 'Equipment Warning Signs', icon: '🚨', prompt: 'Generate a Facebook post about pool equipment warning signs. Include: pump noises, filter issues, heater problems, call immediately. Company: {company}' }
          ]},
          personal_story: { name: '⭐ Customer Story', templates: [
            { id: 'saved_summer', name: 'Saved Their Summer', icon: '🌞', prompt: 'Generate a Facebook post about quick pool repair. Include: emergency situation, fast response, pool restored, customer relief, service CTA. Company: {company}' }
          ]},
          local_alert: { name: '📍 Local Alert', templates: [
            { id: 'season_prep', name: 'Season Opening Alert', icon: '📅', prompt: 'Generate a Facebook post about pool season opening. Include: book early, limited spots, get ready for summer, booking CTA. Company: {company}' }
          ]},
          newsletter: { name: '📧 Newsletter Promo', templates: [
            { id: 'pool_tips', name: 'Pool Care Newsletter', icon: '📬', prompt: 'Generate a Facebook post promoting pool care newsletter. Include: seasonal tips, chemical guidance, exclusive deals, signup CTA. Company: {company}' }
          ]},
          social_proof: { name: '🏆 Social Proof', templates: [
            { id: 'pools_maintained', name: 'Pools We Maintain', icon: '🏊', prompt: 'Generate a Facebook post about pools maintained. Include: customer count, years in business, crystal clear results, service CTA. Company: {company}' }
          ]}
        }
      },
      garage_door: {
        name: 'Garage Door',
        icon: '🚪',
        description: 'Installation, Repair, Openers',
        goals: {
          special_offer: { name: '🎁 Special Offer', templates: [
            { id: 'free_inspection', name: 'Free Safety Inspection', icon: '🔍', prompt: 'Generate a Facebook post for FREE garage door safety inspection. Include: safety concerns, what inspection covers, prevent accidents, spring replacement, booking CTA. Company: {company}' },
            { id: 'opener_upgrade', name: 'Smart Opener Upgrade', icon: '📱', prompt: 'Generate a Facebook post for smart garage door opener upgrade special. Include: smartphone control, security features, installation details, special pricing, booking CTA. Company: {company}' }
          ]},
          value_tips: { name: '💡 Value Tips', templates: [
            { id: 'maintenance', name: 'Maintenance Tips', icon: '🔧', prompt: 'Generate a Facebook post with garage door maintenance tips. Include: lubrication, balance test, safety features, extend door life, professional service option. Company: {company}' }
          ]},
          cost_saver: { name: '💰 Cost Saver', templates: [
            { id: 'prevent_replacement', name: 'Prevent Full Replacement', icon: '💵', prompt: 'Generate a Facebook post about preventing garage door replacement. Include: maintenance value, small repairs vs new door, cost comparison. Company: {company}' }
          ]},
          quick_tip: { name: '⚡ Quick Tip', templates: [
            { id: 'safety_sensors', name: 'Test Safety Sensors', icon: '👁️', prompt: 'Generate a brief Facebook post about testing garage door safety sensors. Include: why important, how to test, safety first, service available. Company: {company}' }
          ]},
          diy_guide: { name: '🔨 DIY Guide', templates: [
            { id: 'balance_test', name: 'DIY Balance Test', icon: '⚖️', prompt: 'Generate a Facebook post with DIY garage door balance test steps. Include: how to test, what to look for, when to call pro, safety warning. Company: {company}' }
          ]},
          warning_post: { name: '⚠️ Warning Post', templates: [
            { id: 'danger_signs', name: 'Danger Signs', icon: '🚨', prompt: 'Generate a Facebook post about garage door danger signs. Include: strange noises, slow operation, sagging, safety risks, call immediately. Company: {company}' },
            { id: 'spring_danger', name: 'Spring Replacement Danger', icon: '⚠️', prompt: 'Generate a Facebook post about garage door spring danger. Include: never DIY springs, injury risks, professional only, emergency service. Company: {company}' }
          ]},
          personal_story: { name: '⭐ Customer Story', templates: [
            { id: 'prevented_accident', name: 'Prevented an Accident', icon: '🛡️', prompt: 'Generate a Facebook post about preventing garage door accident. Include: safety inspection caught issue, customer relief, disaster avoided, inspection CTA. Company: {company}' }
          ]},
          local_alert: { name: '📍 Local Alert', templates: [
            { id: 'weather_check', name: 'Weather Check Alert', icon: '🌨️', prompt: 'Generate a Facebook post about checking garage door before winter. Include: weatherstripping, insulation, freeze protection, service ready. Company: {company}' }
          ]},
          newsletter: { name: '📧 Newsletter Promo', templates: [
            { id: 'door_care', name: 'Door Care Newsletter', icon: '📬', prompt: 'Generate a Facebook post promoting garage door newsletter. Include: maintenance tips, safety reminders, special offers, signup CTA. Company: {company}' }
          ]},
          social_proof: { name: '🏆 Social Proof', templates: [
            { id: 'doors_serviced', name: 'Doors We\'ve Serviced', icon: '🚪', prompt: 'Generate a Facebook post about garage doors serviced. Include: local presence, safety focus, customer trust, service CTA. Company: {company}' }
          ]}
        }
      },
      appliance_repair: {
        name: 'Appliance Repair',
        icon: '🔧',
        description: 'Washer, Dryer, Fridge, Oven',
        goals: {
          special_offer: { name: '🎁 Special Offer', templates: [
            { id: 'same_day', name: 'Same-Day Repair', icon: '⚡', prompt: 'Generate a Facebook post for same-day appliance repair. Include: fast response, all major brands, experienced technicians, fair pricing, booking CTA. Company: {company}' },
            { id: 'diagnostic', name: 'Diagnostic Special', icon: '🔍', prompt: 'Generate a Facebook post for appliance diagnostic special. Include: discounted diagnostic, identify problem, upfront pricing, repair advice, booking CTA. Company: {company}' }
          ]},
          value_tips: { name: '💡 Value Tips', templates: [
            { id: 'extend_life', name: 'Extend Appliance Life', icon: '💡', prompt: 'Generate a Facebook post with tips to extend appliance lifespan. Include: cleaning tips, proper usage, maintenance schedule, when to service. Company: {company}' }
          ]},
          cost_saver: { name: '💰 Cost Saver', templates: [
            { id: 'repair_vs_replace', name: 'Repair vs Replace', icon: '🤔', prompt: 'Generate a Facebook post about when to repair vs replace appliances. Include: age factors, cost comparison, efficiency benefits, consultation offer. Company: {company}' }
          ]},
          quick_tip: { name: '⚡ Quick Tip', templates: [
            { id: 'filter_reminder', name: 'Filter Replacement Reminder', icon: '🔄', prompt: 'Generate a brief Facebook post about appliance filter replacement. Include: why important, frequency, performance impact, service available. Company: {company}' }
          ]},
          diy_guide: { name: '🔨 DIY Guide', templates: [
            { id: 'basic_maintenance', name: 'Basic Maintenance', icon: '🔧', prompt: 'Generate a Facebook post with DIY appliance maintenance. Include: simple tasks, extend lifespan, when to call professional. Company: {company}' }
          ]},
          warning_post: { name: '⚠️ Warning Post', templates: [
            { id: 'warning_signs', name: 'Warning Signs', icon: '🚨', prompt: 'Generate a Facebook post about appliance warning signs. Include: strange noises, performance issues, safety risks, call immediately. Company: {company}' }
          ]},
          personal_story: { name: '⭐ Customer Story', templates: [
            { id: 'saved_thanksgiving', name: 'Saved Thanksgiving', icon: '🦃', prompt: 'Generate a Facebook post about emergency appliance repair before holiday. Include: customer relief, fast response, crisis averted, service CTA. Company: {company}' }
          ]},
          local_alert: { name: '📍 Local Alert', templates: [
            { id: 'holiday_prep', name: 'Holiday Appliance Check', icon: '🎉', prompt: 'Generate a Facebook post about checking appliances before holidays. Include: prevent breakdowns, peak usage times, service availability, booking CTA. Company: {company}' }
          ]},
          newsletter: { name: '📧 Newsletter Promo', templates: [
            { id: 'appliance_tips', name: 'Appliance Care Newsletter', icon: '📬', prompt: 'Generate a Facebook post promoting appliance care newsletter. Include: maintenance tips, troubleshooting, exclusive deals, signup CTA. Company: {company}' }
          ]},
          social_proof: { name: '🏆 Social Proof', templates: [
            { id: 'repairs_completed', name: 'Repairs Completed', icon: '🔧', prompt: 'Generate a Facebook post about appliances repaired. Include: all brands serviced, customer satisfaction, local trust, service CTA. Company: {company}' }
          ]}
        }
      },
      carpet_cleaning: {
        name: 'Carpet Cleaning',
        icon: '🧽',
        description: 'Carpet, Upholstery, Tile',
        goals: {
          special_offer: { name: '🎁 Special Offer', templates: [
            { id: 'spring_special', name: 'Spring Cleaning Special', icon: '🌸', prompt: 'Generate a Facebook post for carpet cleaning spring special. Include: per room pricing, eco-friendly solutions, fast drying, stain removal, booking CTA. Company: {company}' },
            { id: 'whole_house', name: 'Whole House Package', icon: '🏠', prompt: 'Generate a Facebook post for whole house carpet cleaning package. Include: multiple rooms discount, upholstery add-on, deep clean results, package pricing, booking CTA. Company: {company}' }
          ]},
          value_tips: { name: '💡 Value Tips', templates: [
            { id: 'carpet_care', name: 'Carpet Care Tips', icon: '🧹', prompt: 'Generate a Facebook post with carpet maintenance tips. Include: regular vacuuming, spot cleaning, professional cleaning frequency, extend carpet life. Company: {company}' }
          ]},
          cost_saver: { name: '💰 Cost Saver', templates: [
            { id: 'extend_life', name: 'Extend Carpet Life', icon: '💰', prompt: 'Generate a Facebook post about extending carpet lifespan. Include: professional cleaning value, delay replacement, cost comparison. Company: {company}' }
          ]},
          quick_tip: { name: '⚡ Quick Tip', templates: [
            { id: 'spot_clean', name: 'Spot Cleaning Basics', icon: '🧽', prompt: 'Generate a brief Facebook post about carpet spot cleaning. Include: act fast, blot don\'t rub, what to avoid, when to call pro. Company: {company}' }
          ]},
          diy_guide: { name: '🔨 DIY Guide', templates: [
            { id: 'diy_dangers', name: 'DIY Cleaning Dangers', icon: '⚠️', prompt: 'Generate a Facebook post about DIY carpet cleaning mistakes. Include: common errors, damage risks, professional equipment benefits. Company: {company}' }
          ]},
          warning_post: { name: '⚠️ Warning Post', templates: [
            { id: 'mold_alert', name: 'Mold & Mildew Alert', icon: '🚨', prompt: 'Generate a Facebook post about carpet mold/mildew. Include: warning signs, health risks, professional treatment, prevention tips. Company: {company}' }
          ]},
          personal_story: { name: '⭐ Customer Story', templates: [
            { id: 'pet_miracle', name: 'Pet Stain Miracle', icon: '🐾', prompt: 'Generate a Facebook post about removing impossible pet stains. Include: specialized treatment, customer amazement, before/after, service CTA. Company: {company}' }
          ]},
          local_alert: { name: '📍 Local Alert', templates: [
            { id: 'season_refresh', name: 'Seasonal Refresh', icon: '🍂', prompt: 'Generate a Facebook post about seasonal carpet cleaning. Include: allergen removal, fresh start, booking now, limited slots. Company: {company}' }
          ]},
          newsletter: { name: '📧 Newsletter Promo', templates: [
            { id: 'cleaning_tips', name: 'Cleaning Tips Newsletter', icon: '📬', prompt: 'Generate a Facebook post promoting cleaning tips newsletter. Include: stain removal, maintenance, exclusive deals, signup CTA. Company: {company}' }
          ]},
          social_proof: { name: '🏆 Social Proof', templates: [
            { id: 'homes_cleaned', name: 'Homes We\'ve Cleaned', icon: '🏠', prompt: 'Generate a Facebook post about homes cleaned. Include: satisfaction rate, eco-friendly focus, local trust, service CTA. Company: {company}' }
          ]}
        }
      },
      window_cleaning: {
        name: 'Window Cleaning',
        icon: '🪟',
        description: 'Residential, Commercial, High-Rise',
        goals: {
          special_offer: { name: '🎁 Special Offer', templates: [
            { id: 'first_clean', name: 'First Clean Discount', icon: '💰', prompt: 'Generate a Facebook post for first-time window cleaning discount. Include: inside and out, screen cleaning, streak-free results, special pricing, booking CTA. Company: {company}' },
            { id: 'seasonal_plan', name: 'Seasonal Plans', icon: '📅', prompt: 'Generate a Facebook post for seasonal window cleaning plans. Include: 2x or 4x per year, always clear views, discounted pricing, booking CTA. Company: {company}' }
          ]},
          value_tips: { name: '💡 Value Tips', templates: [
            { id: 'window_tips', name: 'Window Cleaning Tips', icon: '💡', prompt: 'Generate a Facebook post with DIY window cleaning tips. Include: best techniques, product recommendations, streak prevention, when to hire pros. Company: {company}' },
            { id: 'frequency', name: 'Cleaning Frequency', icon: '📅', prompt: 'Generate a Facebook post about how often to clean windows. Include: seasonal factors, home location, health benefits, professional service value. Company: {company}' }
          ]},
          cost_saver: { name: '💰 Cost Saver', templates: [
            { id: 'prevent_damage', name: 'Prevent Window Damage', icon: '🛡️', prompt: 'Generate a Facebook post about preventing window damage. Include: hard water, mineral buildup, screen care, professional maintenance value. Company: {company}' }
          ]},
          quick_tip: { name: '⚡ Quick Tip', templates: [
            { id: 'streak_free', name: 'Streak-Free Secret', icon: '✨', prompt: 'Generate a brief Facebook post about streak-free windows. Include: professional technique, best time to clean, service option. Company: {company}' }
          ]},
          diy_guide: { name: '🔨 DIY Guide', templates: [
            { id: 'diy_basics', name: 'DIY Window Cleaning', icon: '🪟', prompt: 'Generate a Facebook post with DIY window cleaning guide. Include: tools needed, step-by-step, common mistakes, when to call pro. Company: {company}' }
          ]},
          warning_post: { name: '⚠️ Warning Post', templates: [
            { id: 'high_risk', name: 'High Window Danger', icon: '⚠️', prompt: 'Generate a Facebook post about high window cleaning dangers. Include: ladder risks, safety first, professional equipment, never DIY high windows. Company: {company}' }
          ]},
          personal_story: { name: '⭐ Customer Story', templates: [
            { id: 'view_restored', name: 'View Restored', icon: '🌅', prompt: 'Generate a Facebook post about restoring customer\'s view. Include: years of buildup, dramatic improvement, customer joy, service CTA. Company: {company}' }
          ]},
          local_alert: { name: '📍 Local Alert', templates: [
            { id: 'storm_damage', name: 'Post-Storm Window Check', icon: '🌧️', prompt: 'Generate a Facebook post about checking windows after storm. Include: damage assessment, clean up debris, service available, booking CTA. Company: {company}' }
          ]},
          newsletter: { name: '📧 Newsletter Promo', templates: [
            { id: 'window_care', name: 'Window Care Newsletter', icon: '📬', prompt: 'Generate a Facebook post promoting window care newsletter. Include: seasonal tips, maintenance reminders, exclusive deals, signup CTA. Company: {company}' }
          ]},
          social_proof: { name: '🏆 Social Proof', templates: [
            { id: 'windows_cleaned', name: 'Windows We\'ve Cleaned', icon: '🪟', prompt: 'Generate a Facebook post about windows cleaned. Include: residential & commercial, high-rise experience, satisfaction rate, service CTA. Company: {company}' }
          ]}
        }
      },
      painting: {
        name: 'Painting',
        icon: '🎨',
        description: 'Interior, Exterior, Commercial',
        goals: {
          special_offer: { name: '🎁 Special Offer', templates: [
            { id: 'free_consult', name: 'Free Color Consultation', icon: '🔍', prompt: 'Generate a Facebook post for FREE painting estimates and color consultation. Include: interior/exterior, color expert advice, quality materials, booking CTA. Company: {company}' },
            { id: 'spring_paint', name: 'Spring Painting Special', icon: '🌸', prompt: 'Generate a Facebook post for spring painting special. Include: refresh your home, interior or exterior, perfect weather, special pricing, booking CTA. Company: {company}' }
          ]},
          value_tips: { name: '💡 Value Tips', templates: [
            { id: 'color_trends', name: 'Color Trends', icon: '🎨', prompt: 'Generate a Facebook post about current paint color trends. Include: popular colors, mood effects, room-specific suggestions, consultation offer. Company: {company}' }
          ]},
          cost_saver: { name: '💰 Cost Saver', templates: [
            { id: 'protect_investment', name: 'Protect Your Investment', icon: '🏠', prompt: 'Generate a Facebook post about how painting protects your home. Include: exterior protection, interior refresh, increase value, cost vs benefit. Company: {company}' }
          ]},
          quick_tip: { name: '⚡ Quick Tip', templates: [
            { id: 'paint_prep', name: 'Painting Prep Matters', icon: '🔧', prompt: 'Generate a brief Facebook post about painting prep importance. Include: why prep matters, professional difference, quality results. Company: {company}' }
          ]},
          diy_guide: { name: '🔨 DIY Guide', templates: [
            { id: 'diy_vs_pro', name: 'DIY vs Professional', icon: '🤔', prompt: 'Generate a Facebook post about DIY vs professional painting. Include: time investment, quality differences, cost comparison, when to hire pros. Company: {company}' }
          ]},
          warning_post: { name: '⚠️ Warning Post', templates: [
            { id: 'cheap_paint', name: 'Cheap Paint Warning', icon: '⚠️', prompt: 'Generate a Facebook post about cheap paint risks. Include: coverage issues, durability, hidden costs, value of quality. Company: {company}' }
          ]},
          personal_story: { name: '⭐ Customer Story', templates: [
            { id: 'transformation', name: 'Home Transformation', icon: '✨', prompt: 'Generate a Facebook post about dramatic home transformation. Include: before/after, customer excitement, color impact, consultation CTA. Company: {company}' }
          ]},
          local_alert: { name: '📍 Local Alert', templates: [
            { id: 'weather_window', name: 'Perfect Painting Weather', icon: '🌤️', prompt: 'Generate a Facebook post about ideal painting weather. Include: best conditions, book now, limited availability, seasonal timing. Company: {company}' }
          ]},
          newsletter: { name: '📧 Newsletter Promo', templates: [
            { id: 'paint_tips', name: 'Painting Tips Newsletter', icon: '📬', prompt: 'Generate a Facebook post promoting painting newsletter. Include: color advice, maintenance tips, exclusive deals, signup CTA. Company: {company}' }
          ]},
          social_proof: { name: '🏆 Social Proof', templates: [
            { id: 'projects_done', name: 'Projects Completed', icon: '🎨', prompt: 'Generate a Facebook post about painting projects completed. Include: local homes painted, customer satisfaction, quality focus, service CTA. Company: {company}' }
          ]}
        }
      },
      locksmith: {
        name: 'Locksmith',
        icon: '🔑',
        description: 'Locks, Keys, Security Systems',
        goals: {
          special_offer: { name: '🎁 Special Offer', templates: [
            { id: 'emergency_lockout', name: '24/7 Emergency Lockout', icon: '🚨', prompt: 'Generate a Facebook post for 24/7 emergency locksmith service. Include: locked out scenarios, fast response, mobile service, fair pricing, call now CTA. Company: {company}' },
            { id: 'rekey_special', name: 'Rekey Service Special', icon: '🔐', prompt: 'Generate a Facebook post for lock rekey service. Include: moving into new home, lost keys, security upgrade, affordable pricing, booking CTA. Company: {company}' }
          ]},
          value_tips: { name: '💡 Value Tips', templates: [
            { id: 'security_tips', name: 'Home Security Tips', icon: '🛡️', prompt: 'Generate a Facebook post with home security tips. Include: lock quality, deadbolts, door reinforcement, key control, professional assessment. Company: {company}' },
            { id: 'lock_types', name: 'Lock Types Explained', icon: '🔍', prompt: 'Generate a Facebook post explaining different lock types. Include: deadbolts, smart locks, high-security, best for each situation, consultation offer. Company: {company}' }
          ]},
          cost_saver: { name: '💰 Cost Saver', templates: [
            { id: 'rekey_vs_replace', name: 'Rekey vs Replace', icon: '🔑', prompt: 'Generate a Facebook post about rekey vs replace locks. Include: cost comparison, when each makes sense, security benefits. Company: {company}' }
          ]},
          quick_tip: { name: '⚡ Quick Tip', templates: [
            { id: 'key_control', name: 'Key Control Tips', icon: '🗝️', prompt: 'Generate a brief Facebook post about key control. Include: who has keys, tracking copies, when to rekey, security first. Company: {company}' }
          ]},
          diy_guide: { name: '🔨 DIY Guide', templates: [
            { id: 'simple_fixes', name: 'Simple Lock Fixes', icon: '🔧', prompt: 'Generate a Facebook post with simple lock fixes. Include: sticky locks, loose handles, when DIY is okay, when to call pro. Company: {company}' }
          ]},
          warning_post: { name: '⚠️ Warning Post', templates: [
            { id: 'security_risks', name: 'Common Security Risks', icon: '⚠️', prompt: 'Generate a Facebook post about home security risks. Include: weak locks, poor key control, outdated systems, professional assessment offer. Company: {company}' }
          ]},
          personal_story: { name: '⭐ Customer Story', templates: [
            { id: 'saved_the_day', name: 'Saved the Day', icon: '🦸', prompt: 'Generate a Facebook post about emergency lockout rescue. Include: customer relief, fast response, professional service, 24/7 availability CTA. Company: {company}' }
          ]},
          local_alert: { name: '📍 Local Alert', templates: [
            { id: 'move_in_season', name: 'Moving Season Alert', icon: '🏠', prompt: 'Generate a Facebook post about rekey services for moving season. Include: new home security, who has old keys, peace of mind, booking CTA. Company: {company}' }
          ]},
          newsletter: { name: '📧 Newsletter Promo', templates: [
            { id: 'security_newsletter', name: 'Security Tips Newsletter', icon: '📬', prompt: 'Generate a Facebook post promoting security newsletter. Include: lock tips, technology updates, special offers, signup CTA. Company: {company}' }
          ]},
          social_proof: { name: '🏆 Social Proof', templates: [
            { id: 'customers_secured', name: 'Customers Secured', icon: '🔐', prompt: 'Generate a Facebook post about customers served. Include: local trust, emergency availability, professional service, security focus. Company: {company}' }
          ]}
        }
      },
      general_contractor: {
        name: 'General Contractor',
        icon: '🏗️',
        description: 'Remodeling, Renovations, Additions',
        goals: {
          special_offer: { name: '🎁 Special Offer', templates: [
            { id: 'free_consult', name: 'Free Design Consultation', icon: '📐', prompt: 'Generate a Facebook post for FREE remodeling consultation. Include: kitchen/bath remodels, additions, design expertise, licensed and insured, booking CTA. Company: {company}' },
            { id: 'kitchen_special', name: 'Kitchen Remodel Special', icon: '🍳', prompt: 'Generate a Facebook post for kitchen remodeling special. Include: complete transformation, quality materials, timeline, increase home value, free quote CTA. Company: {company}' }
          ]},
          value_tips: { name: '💡 Value Tips', templates: [
            { id: 'remodel_roi', name: 'Remodel ROI Guide', icon: '💰', prompt: 'Generate a Facebook post about remodeling ROI. Include: best value projects, kitchen/bath returns, market trends, consultation offer. Company: {company}' },
            { id: 'planning_tips', name: 'Remodel Planning', icon: '📋', prompt: 'Generate a Facebook post with remodeling planning tips. Include: budget setting, timeline expectations, choosing contractor, permits, professional guidance. Company: {company}' }
          ]},
          cost_saver: { name: '💰 Cost Saver', templates: [
            { id: 'avoid_mistakes', name: 'Avoid Costly Mistakes', icon: '⚠️', prompt: 'Generate a Facebook post about avoiding remodeling mistakes. Include: common errors, budget overruns, quality shortcuts, professional value. Company: {company}' }
          ]},
          quick_tip: { name: '⚡ Quick Tip', templates: [
            { id: 'contractor_selection', name: 'Choosing a Contractor', icon: '✅', prompt: 'Generate a brief Facebook post about choosing a contractor. Include: licensing, insurance, references, red flags. Company: {company}' }
          ]},
          diy_guide: { name: '🔨 DIY Guide', templates: [
            { id: 'diy_vs_pro', name: 'DIY vs Professional', icon: '🤔', prompt: 'Generate a Facebook post about DIY vs professional remodeling. Include: project complexity, permits, resale value, when to hire pros. Company: {company}' }
          ]},
          warning_post: { name: '⚠️ Warning Post', templates: [
            { id: 'unlicensed_contractors', name: 'Unlicensed Contractor Warning', icon: '🚨', prompt: 'Generate a Facebook post warning about unlicensed contractors. Include: legal risks, insurance issues, quality concerns, verify licensing. Company: {company}' }
          ]},
          personal_story: { name: '⭐ Customer Story', templates: [
            { id: 'dream_kitchen', name: 'Dream Kitchen Transformation', icon: '✨', prompt: 'Generate a Facebook post about kitchen transformation. Include: customer vision realized, quality work, timeline met, consultation CTA. Company: {company}' }
          ]},
          local_alert: { name: '📍 Local Alert', templates: [
            { id: 'project_season', name: 'Remodeling Season', icon: '🛠️', prompt: 'Generate a Facebook post about ideal remodeling timing. Include: schedule now, booking up, seasonal benefits, consultation CTA. Company: {company}' }
          ]},
          newsletter: { name: '📧 Newsletter Promo', templates: [
            { id: 'remodel_newsletter', name: 'Remodeling Newsletter', icon: '📬', prompt: 'Generate a Facebook post promoting remodeling newsletter. Include: design trends, planning tips, project showcases, signup CTA. Company: {company}' }
          ]},
          social_proof: { name: '🏆 Social Proof', templates: [
            { id: 'projects_completed', name: 'Projects Completed', icon: '🏗️', prompt: 'Generate a Facebook post about remodeling projects completed. Include: local homes transformed, customer satisfaction, licensed and insured. Company: {company}' }
          ]}
        }
      },
      tree_service: {
        name: 'Tree Services',
        icon: '🌲',
        description: 'Trimming, Removal, Stump Grinding',
        goals: {
          special_offer: { name: '🎁 Special Offer', templates: [
            { id: 'free_assessment', name: 'Free Tree Assessment', icon: '🔍', prompt: 'Generate a Facebook post for FREE tree assessment. Include: safety inspection, health evaluation, trimming/removal recommendations, insurance work, booking CTA. Company: {company}' },
            { id: 'seasonal_trim', name: 'Seasonal Trimming Special', icon: '✂️', prompt: 'Generate a Facebook post for seasonal tree trimming. Include: improve tree health, prevent storm damage, curb appeal, safety, booking CTA. Company: {company}' }
          ]},
          value_tips: { name: '💡 Value Tips', templates: [
            { id: 'tree_health', name: 'Tree Health Signs', icon: '🌳', prompt: 'Generate a Facebook post about tree health warning signs. Include: disease symptoms, dead branches, root issues, when to remove, professional assessment. Company: {company}' },
            { id: 'trimming_timing', name: 'When to Trim Trees', icon: '📅', prompt: 'Generate a Facebook post about tree trimming timing. Include: seasonal recommendations, species considerations, benefits of proper timing. Company: {company}' }
          ]},
          cost_saver: { name: '💰 Cost Saver', templates: [
            { id: 'prevent_damage', name: 'Prevent Storm Damage', icon: '⛈️', prompt: 'Generate a Facebook post about preventing tree storm damage. Include: maintenance value, trimming benefits, insurance savings, professional assessment. Company: {company}' }
          ]},
          quick_tip: { name: '⚡ Quick Tip', templates: [
            { id: 'watering_tips', name: 'Tree Watering Tips', icon: '💧', prompt: 'Generate a brief Facebook post about tree watering. Include: proper frequency, deep watering, seasonal needs, tree health. Company: {company}' }
          ]},
          diy_guide: { name: '🔨 DIY Guide', templates: [
            { id: 'small_pruning', name: 'DIY Small Branch Pruning', icon: '✂️', prompt: 'Generate a Facebook post with DIY pruning tips for small branches. Include: proper cuts, safety, when to call professional, equipment needed. Company: {company}' }
          ]},
          warning_post: { name: '⚠️ Warning Post', templates: [
            { id: 'diy_danger', name: 'Tree Work Dangers', icon: '🚨', prompt: 'Generate a Facebook post about tree work dangers. Include: injury risks, property damage, power lines, professional equipment needed. Company: {company}' }
          ]},
          personal_story: { name: '⭐ Customer Story', templates: [
            { id: 'saved_home', name: 'Saved the Home', icon: '🏠', prompt: 'Generate a Facebook post about removing dangerous tree. Include: customer relief, prevented damage, professional assessment, safety first. Company: {company}' }
          ]},
          local_alert: { name: '📍 Local Alert', templates: [
            { id: 'storm_prep', name: 'Storm Season Prep', icon: '⛈️', prompt: 'Generate a Facebook post about storm prep for trees. Include: assess now, prevent damage, emergency services, booking CTA. Company: {company}' }
          ]},
          newsletter: { name: '📧 Newsletter Promo', templates: [
            { id: 'tree_care', name: 'Tree Care Newsletter', icon: '📬', prompt: 'Generate a Facebook post promoting tree care newsletter. Include: seasonal tips, health monitoring, storm prep, signup CTA. Company: {company}' }
          ]},
          social_proof: { name: '🏆 Social Proof', templates: [
            { id: 'trees_serviced', name: 'Trees We\'ve Serviced', icon: '🌲', prompt: 'Generate a Facebook post about trees serviced. Include: local experience, safety record, customer satisfaction, service CTA. Company: {company}' }
          ]}
        }
      },
      fence_installation: {
        name: 'Fence Installation',
        icon: '🪵',
        description: 'Wood, Vinyl, Chain Link, Iron',
        goals: {
          special_offer: { name: '🎁 Special Offer', templates: [
            { id: 'free_quote', name: 'Free Fence Quote', icon: '📐', prompt: 'Generate a Facebook post for FREE fence installation quote. Include: material options (wood, vinyl, chain link), privacy vs decorative, quality installation, booking CTA. Company: {company}' },
            { id: 'privacy_fence', name: 'Privacy Fence Special', icon: '🏠', prompt: 'Generate a Facebook post for privacy fence installation. Include: enjoy your backyard, height options, material choices, quick installation, booking CTA. Company: {company}' }
          ]},
          value_tips: { name: '💡 Value Tips', templates: [
            { id: 'material_guide', name: 'Fence Material Guide', icon: '🪵', prompt: 'Generate a Facebook post comparing fence materials. Include: wood, vinyl, chain link pros/cons, durability, maintenance, pricing. Company: {company}' },
            { id: 'maintenance_tips', name: 'Fence Maintenance', icon: '🔧', prompt: 'Generate a Facebook post with fence maintenance tips. Include: cleaning, staining, repair minor damage, extend fence life. Company: {company}' }
          ]},
          cost_saver: { name: '💰 Cost Saver', templates: [
            { id: 'property_value', name: 'Fences & Property Value', icon: '💰', prompt: 'Generate a Facebook post about how fences increase property value. Include: curb appeal, privacy benefits, security, ROI. Company: {company}' }
          ]},
          quick_tip: { name: '⚡ Quick Tip', templates: [
            { id: 'fence_planning', name: 'Fence Planning Basics', icon: '📏', prompt: 'Generate a brief Facebook post about fence planning. Include: property lines, permits, HOA rules, free consultation offer. Company: {company}' }
          ]},
          diy_guide: { name: '🔨 DIY Guide', templates: [
            { id: 'diy_vs_pro', name: 'DIY vs Professional Fence', icon: '🤔', prompt: 'Generate a Facebook post about DIY vs professional fence installation. Include: time, tools, quality, permits, when to hire pro. Company: {company}' }
          ]},
          warning_post: { name: '⚠️ Warning Post', templates: [
            { id: 'property_lines', name: 'Property Line Warning', icon: '⚠️', prompt: 'Generate a Facebook post about fence property line issues. Include: survey importance, neighbor disputes, legal issues, professional guidance. Company: {company}' }
          ]},
          personal_story: { name: '⭐ Customer Story', templates: [
            { id: 'backyard_transformation', name: 'Backyard Transformation', icon: '✨', prompt: 'Generate a Facebook post about backyard transformation with fence. Include: customer satisfaction, privacy gained, quality install, consultation CTA. Company: {company}' }
          ]},
          local_alert: { name: '📍 Local Alert', templates: [
            { id: 'install_season', name: 'Fence Installation Season', icon: '🛠️', prompt: 'Generate a Facebook post about ideal fence installation timing. Include: weather conditions, booking now, schedule filling, free quote CTA. Company: {company}' }
          ]},
          newsletter: { name: '📧 Newsletter Promo', templates: [
            { id: 'fence_newsletter', name: 'Fence Care Newsletter', icon: '📬', prompt: 'Generate a Facebook post promoting fence newsletter. Include: material comparisons, maintenance tips, design ideas, signup CTA. Company: {company}' }
          ]},
          social_proof: { name: '🏆 Social Proof', templates: [
            { id: 'fences_installed', name: 'Fences We\'ve Installed', icon: '🪵', prompt: 'Generate a Facebook post about fences installed. Include: local homes fenced, quality materials, customer satisfaction, service CTA. Company: {company}' }
          ]}
        }
      },
      junk_removal: {
        name: 'Junk Removal',
        icon: '🚛',
        description: 'Hauling, Cleanouts, Demolition',
        goals: {
          special_offer: { name: '🎁 Special Offer', templates: [
            { id: 'same_day', name: 'Same-Day Junk Removal', icon: '⚡', prompt: 'Generate a Facebook post for same-day junk removal. Include: no job too big, fast service, eco-friendly disposal, upfront pricing, booking CTA. Company: {company}' },
            { id: 'spring_cleanout', name: 'Spring Cleanout Special', icon: '🌸', prompt: 'Generate a Facebook post for spring cleanout special. Include: declutter your space, garage/basement/attic, free up room, special pricing, booking CTA. Company: {company}' }
          ]},
          value_tips: { name: '💡 Value Tips', templates: [
            { id: 'declutter_tips', name: 'Decluttering Tips', icon: '💡', prompt: 'Generate a Facebook post with decluttering tips. Include: room-by-room approach, donate vs trash, mental health benefits, professional help option. Company: {company}' },
            { id: 'eco_disposal', name: 'Eco-Friendly Disposal', icon: '♻️', prompt: 'Generate a Facebook post about eco-friendly junk disposal. Include: recycling commitment, donation programs, proper disposal methods. Company: {company}' }
          ]},
          cost_saver: { name: '💰 Cost Saver', templates: [
            { id: 'reclaim_space', name: 'Reclaim Your Space', icon: '🏠', prompt: 'Generate a Facebook post about reclaiming space value. Include: unused space costs, rental savings, productivity boost, booking value. Company: {company}' }
          ]},
          quick_tip: { name: '⚡ Quick Tip', templates: [
            { id: 'sort_before', name: 'Sort Before Haul', icon: '📦', prompt: 'Generate a brief Facebook post about sorting junk before removal. Include: donate pile, recycle pile, trash pile, save money. Company: {company}' }
          ]},
          diy_guide: { name: '🔨 DIY Guide', templates: [
            { id: 'declutter_method', name: 'Decluttering Method', icon: '📋', prompt: 'Generate a Facebook post with decluttering method. Include: one room at a time, keep/donate/trash, when to call professional. Company: {company}' }
          ]},
          warning_post: { name: '⚠️ Warning Post', templates: [
            { id: 'hoarding_health', name: 'Hoarding Health Risks', icon: '⚠️', prompt: 'Generate a Facebook post about clutter health risks. Include: fire hazards, pest attraction, mental health, professional help available. Company: {company}' }
          ]},
          personal_story: { name: '⭐ Customer Story', templates: [
            { id: 'estate_cleanout', name: 'Compassionate Estate Cleanout', icon: '🏠', prompt: 'Generate a Facebook post about estate cleanout service. Include: compassionate approach, family relief, efficient service, donation coordination. Company: {company}' }
          ]},
          local_alert: { name: '📍 Local Alert', templates: [
            { id: 'season_cleanup', name: 'Seasonal Cleanup Time', icon: '🍂', prompt: 'Generate a Facebook post about seasonal cleanup. Include: perfect timing, fresh start, free estimates, booking CTA. Company: {company}' }
          ]},
          newsletter: { name: '📧 Newsletter Promo', templates: [
            { id: 'declutter_newsletter', name: 'Decluttering Newsletter', icon: '📬', prompt: 'Generate a Facebook post promoting decluttering newsletter. Include: organization tips, disposal guides, special offers, signup CTA. Company: {company}' }
          ]},
          social_proof: { name: '🏆 Social Proof', templates: [
            { id: 'homes_cleared', name: 'Homes We\'ve Cleared', icon: '🚛', prompt: 'Generate a Facebook post about homes cleared. Include: local trust, eco-friendly disposal, fast service, customer relief. Company: {company}' }
          ]}
        }
      },
      gutter_cleaning: {
        name: 'Gutter Cleaning',
        icon: '💧',
        description: 'Cleaning, Repair, Installation',
        goals: {
          special_offer: { name: '🎁 Special Offer', templates: [
            { id: 'fall_special', name: 'Fall Cleaning Special', icon: '🍂', prompt: 'Generate a Facebook post for fall gutter cleaning. Include: prevent winter damage, leaf removal, downspout check, special pricing, booking CTA. Company: {company}' },
            { id: 'gutter_guards', name: 'Gutter Guard Installation', icon: '🛡️', prompt: 'Generate a Facebook post for gutter guard installation. Include: never clean again, prevent clogs, protect foundation, installation details, booking CTA. Company: {company}' }
          ]},
          value_tips: { name: '💡 Value Tips', templates: [
            { id: 'frequency', name: 'Cleaning Frequency Guide', icon: '📅', prompt: 'Generate a Facebook post about gutter cleaning frequency. Include: seasonal recommendations, tree coverage factors, signs of clogs, professional service benefits. Company: {company}' },
            { id: 'water_damage', name: 'Prevent Water Damage', icon: '💧', prompt: 'Generate a Facebook post about how gutters prevent water damage. Include: foundation protection, basement flooding, landscaping preservation, maintenance importance. Company: {company}' }
          ]},
          cost_saver: { name: '💰 Cost Saver', templates: [
            { id: 'foundation_protection', name: 'Foundation Protection', icon: '🏠', prompt: 'Generate a Facebook post about gutters protecting foundation. Include: water damage costs, foundation repair expense, gutter maintenance value. Company: {company}' }
          ]},
          quick_tip: { name: '⚡ Quick Tip', templates: [
            { id: 'inspect_after_storm', name: 'Inspect After Storms', icon: '⛈️', prompt: 'Generate a brief Facebook post about inspecting gutters after storms. Include: check for damage, debris removal, prevent issues. Company: {company}' }
          ]},
          diy_guide: { name: '🔨 DIY Guide', templates: [
            { id: 'safe_cleaning', name: 'Safe DIY Gutter Cleaning', icon: '🪜', prompt: 'Generate a Facebook post with DIY gutter cleaning tips. Include: ladder safety, proper tools, when to call professional, roof safety. Company: {company}' }
          ]},
          warning_post: { name: '⚠️ Warning Post', templates: [
            { id: 'clog_damage', name: 'Clogged Gutter Damage', icon: '🚨', prompt: 'Generate a Facebook post about clogged gutter damage. Include: water overflow, foundation issues, ice dams, fascia rot, immediate action needed. Company: {company}' }
          ]},
          personal_story: { name: '⭐ Customer Story', templates: [
            { id: 'prevented_flooding', name: 'Prevented Basement Flooding', icon: '💧', prompt: 'Generate a Facebook post about preventing basement flooding with gutters. Include: customer relief, water damage avoided, professional service value. Company: {company}' }
          ]},
          local_alert: { name: '📍 Local Alert', templates: [
            { id: 'seasonal_cleaning', name: 'Seasonal Cleaning Alert', icon: '🍂', prompt: 'Generate a Facebook post about seasonal gutter cleaning. Include: fall leaves, winter prep, booking now, schedule filling. Company: {company}' }
          ]},
          newsletter: { name: '📧 Newsletter Promo', templates: [
            { id: 'gutter_newsletter', name: 'Gutter Care Newsletter', icon: '📬', prompt: 'Generate a Facebook post promoting gutter care newsletter. Include: maintenance reminders, seasonal tips, exclusive deals, signup CTA. Company: {company}' }
          ]},
          social_proof: { name: '🏆 Social Proof', templates: [
            { id: 'gutters_serviced', name: 'Gutters We\'ve Serviced', icon: '💧', prompt: 'Generate a Facebook post about gutters serviced. Include: local homes protected, prevented damage, customer peace of mind. Company: {company}' }
          ]}
        }
      }
    }
  },
  real_estate: {
    name: 'Real Estate',
    icon: '🏡',
    description: 'Agents, Brokers, Property Management',
    serviceTypes: {
      residential: {
        name: 'Residential Sales',
        icon: '🏠',
        description: 'Family Homes, Condos, Townhouses',
        goals: {
          special_offer: { name: '🎁 Special Offer', templates: [
            { id: 'new_listing', name: 'New Home Listing', icon: '🆕', prompt: 'Generate a Facebook post announcing a new home listing. Include: bedrooms/bathrooms, key features, neighborhood highlights, school district, price range, showing CTA. Company: {company}' },
            { id: 'open_house', name: 'Open House Invite', icon: '🚪', prompt: 'Generate a Facebook post inviting people to an open house. Include: date/time, property highlights, family-friendly features, refreshments mention, RSVP details. Company: {company}' }
          ]},
          value_tips: { name: '💡 Value Tips', templates: [
            { id: 'first_time_buyer', name: 'First-Time Buyer Tips', icon: '🗝️', prompt: 'Generate a Facebook post with first-time homebuyer tips. Include: 3-5 essential tips, financing basics, what to look for, common mistakes, free consultation offer. Company: {company}' },
            { id: 'home_features', name: 'Home Features That Matter', icon: '🏡', prompt: 'Generate a Facebook post about home features buyers value. Include: must-haves, resale value, modern amenities, consultation offer. Company: {company}' }
          ]},
          cost_saver: { name: '💰 Cost Saver', templates: [
            { id: 'negotiation_tips', name: 'Negotiation Strategies', icon: '💬', prompt: 'Generate a Facebook post about home buying negotiation tips. Include: timing, market leverage, inspection leverage, agent value. Company: {company}' }
          ]},
          quick_tip: { name: '⚡ Quick Tip', templates: [
            { id: 'market_update', name: 'Local Market Update', icon: '📈', prompt: 'Generate a brief Facebook post about local residential market trends. Include: current inventory, average prices, seller vs buyer market, consultation CTA. Company: {company}' }
          ]},
          diy_guide: { name: '🔨 DIY Guide', templates: [
            { id: 'home_staging', name: 'Home Staging Basics', icon: '✨', prompt: 'Generate a Facebook post with DIY home staging tips. Include: declutter, neutral colors, curb appeal, professional staging option. Company: {company}' }
          ]},
          warning_post: { name: '⚠️ Warning Post', templates: [
            { id: 'inspection_importance', name: 'Skip Inspection Risk', icon: '🚨', prompt: 'Generate a Facebook post warning about skipping home inspection. Include: hidden issues, costly repairs, negotiation power, professional inspection value. Company: {company}' }
          ]},
          personal_story: { name: '⭐ Customer Story', templates: [
            { id: 'dream_home', name: 'Dream Home Found', icon: '🏠', prompt: 'Generate a Facebook post about helping client find dream home. Include: search journey, perfect match, family happiness, ready to help you CTA. Company: {company}' }
          ]},
          local_alert: { name: '📍 Local Alert', templates: [
            { id: 'new_development', name: 'New Development Alert', icon: '🏘️', prompt: 'Generate a Facebook post about new housing development. Include: location, price range, features, limited availability, showing CTA. Company: {company}' }
          ]},
          newsletter: { name: '📧 Newsletter Promo', templates: [
            { id: 'real_estate_newsletter', name: 'Real Estate Newsletter', icon: '📬', prompt: 'Generate a Facebook post promoting real estate newsletter. Include: market updates, new listings, buying tips, exclusive opportunities, signup CTA. Company: {company}' }
          ]},
          social_proof: { name: '🏆 Social Proof', templates: [
            { id: 'homes_sold', name: 'Homes We\'ve Sold', icon: '🏠', prompt: 'Generate a Facebook post about homes sold. Include: local experience, happy families, market expertise, ready to help you. Company: {company}' }
          ]}
        }
      },
      land_deals: {
        name: 'Land Deals',
        icon: '🏞️',
        description: 'Raw Land, Acreage, Investment Property',
        goals: {
          special_offer: { name: '🎁 Special Offer', templates: [
            { id: 'new_land', name: 'New Land Listing', icon: '🆕', prompt: 'Generate a Facebook post announcing new land for sale. Include: acreage, location highlights, zoning information, utilities availability, road access, investment potential, cash deals welcome, inquiry CTA. Company: {company}' },
            { id: 'investment_land', name: 'Investment Land', icon: '💰', prompt: 'Generate a Facebook post for investment land opportunity. Include: acreage, growth area location, development potential, zoning flexibility, ROI potential, owner financing available, investor CTA. Company: {company}' }
          ]},
          value_tips: { name: '💡 Value Tips', templates: [
            { id: 'land_investment', name: 'Why Invest in Land', icon: '💡', prompt: 'Generate a Facebook post about land investment benefits. Include: appreciation potential, low maintenance, tax benefits, development opportunities, portfolio diversification, consultation offer. Company: {company}' },
            { id: 'due_diligence', name: 'Land Due Diligence', icon: '🔍', prompt: 'Generate a Facebook post about what to check before buying land. Include: zoning laws, utilities, access, soil quality, flood zones, title search, professional help offer. Company: {company}' }
          ]},
          cost_saver: { name: '💰 Cost Saver', templates: [
            { id: 'cash_deals', name: 'Cash Land Deals', icon: '💵', prompt: 'Generate a Facebook post about benefits of cash land purchases. Include: negotiation power, faster closing, no financing, better pricing. Company: {company}' }
          ]},
          quick_tip: { name: '⚡ Quick Tip', templates: [
            { id: 'zoning_basics', name: 'Zoning Basics', icon: '📋', prompt: 'Generate a brief Facebook post about understanding land zoning. Include: what zoning means, why it matters, check before buying. Company: {company}' }
          ]},
          diy_guide: { name: '🔨 DIY Guide', templates: [
            { id: 'land_evaluation', name: 'Land Evaluation Steps', icon: '🗺️', prompt: 'Generate a Facebook post with DIY land evaluation tips. Include: visit in person, check access, utilities, boundaries, professional survey recommendation. Company: {company}' }
          ]},
          warning_post: { name: '⚠️ Warning Post', templates: [
            { id: 'landlocked_warning', name: 'Landlocked Property Risk', icon: '⚠️', prompt: 'Generate a Facebook post warning about landlocked properties. Include: access rights, easement importance, title issues, verify access before buying. Company: {company}' }
          ]},
          personal_story: { name: '⭐ Customer Story', templates: [
            { id: 'investment_success', name: 'Investment Success Story', icon: '💰', prompt: 'Generate a Facebook post about successful land investment. Include: client appreciation, ROI achieved, development completed, ready to help you invest. Company: {company}' }
          ]},
          local_alert: { name: '📍 Local Alert', templates: [
            { id: 'growth_area', name: 'Growth Area Alert', icon: '📈', prompt: 'Generate a Facebook post about land in growth areas. Include: development coming, appreciation potential, limited availability, investment opportunity. Company: {company}' }
          ]},
          newsletter: { name: '📧 Newsletter Promo', templates: [
            { id: 'land_newsletter', name: 'Land Investment Newsletter', icon: '📬', prompt: 'Generate a Facebook post promoting land investment newsletter. Include: new listings, investment tips, market analysis, exclusive deals, signup CTA. Company: {company}' }
          ]},
          social_proof: { name: '🏆 Social Proof', templates: [
            { id: 'land_sold', name: 'Land We\'ve Sold', icon: '🏞️', prompt: 'Generate a Facebook post about land deals closed. Include: acres sold, satisfied investors, local expertise, cash deals welcome. Company: {company}' }
          ]}
        }
      },
      commercial: {
        name: 'Commercial Real Estate',
        icon: '🏢',
        description: 'Office, Retail, Industrial Spaces',
        goals: {
          special_offer: { name: '🎁 Special Offer', templates: [
            { id: 'office_space', name: 'Office Space Listing', icon: '💼', prompt: 'Generate a Facebook post for commercial office space. Include: square footage, location/visibility, parking, amenities, lease terms, business area benefits, showing CTA. Company: {company}' },
            { id: 'retail_space', name: 'Retail Space Listing', icon: '🏪', prompt: 'Generate a Facebook post for retail space. Include: square footage, foot traffic, visibility, parking, neighboring businesses, lease terms, tour CTA. Company: {company}' }
          ]},
          value_tips: { name: '💡 Value Tips', templates: [
            { id: 'lease_vs_buy', name: 'Lease vs Buy Commercial', icon: '⚖️', prompt: 'Generate a Facebook post about leasing vs buying commercial property. Include: pros/cons of each, financing considerations, tax implications, business growth factors, consultation CTA. Company: {company}' },
            { id: 'location_matters', name: 'Location Importance', icon: '📍', prompt: 'Generate a Facebook post about commercial location importance. Include: foot traffic, visibility, parking, customer access, business success. Company: {company}' }
          ]},
          cost_saver: { name: '💰 Cost Saver', templates: [
            { id: 'lease_negotiation', name: 'Lease Negotiation Tips', icon: '💬', prompt: 'Generate a Facebook post about commercial lease negotiation. Include: terms to negotiate, tenant improvements, rent concessions, representation value. Company: {company}' }
          ]},
          quick_tip: { name: '⚡ Quick Tip', templates: [
            { id: 'market_trends', name: 'Commercial Market Trends', icon: '📈', prompt: 'Generate a brief Facebook post about commercial real estate trends. Include: vacancy rates, pricing, hot areas, consultation offer. Company: {company}' }
          ]},
          diy_guide: { name: '🔨 DIY Guide', templates: [
            { id: 'space_evaluation', name: 'Space Evaluation Guide', icon: '📏', prompt: 'Generate a Facebook post with commercial space evaluation tips. Include: measure needs, growth capacity, layout efficiency, professional guidance. Company: {company}' }
          ]},
          warning_post: { name: '⚠️ Warning Post', templates: [
            { id: 'lease_traps', name: 'Commercial Lease Traps', icon: '⚠️', prompt: 'Generate a Facebook post warning about commercial lease traps. Include: hidden costs, CAM charges, long terms, legal review importance. Company: {company}' }
          ]},
          personal_story: { name: '⭐ Customer Story', templates: [
            { id: 'business_success', name: 'Business Location Success', icon: '🎉', prompt: 'Generate a Facebook post about helping business find perfect location. Include: client business thriving, location fit, growth achieved, ready to help you. Company: {company}' }
          ]},
          local_alert: { name: '📍 Local Alert', templates: [
            { id: 'new_commercial', name: 'New Commercial Development', icon: '🏗️', prompt: 'Generate a Facebook post about new commercial development. Include: location, space types, lease terms, limited availability, tour CTA. Company: {company}' }
          ]},
          newsletter: { name: '📧 Newsletter Promo', templates: [
            { id: 'commercial_newsletter', name: 'Commercial Real Estate Newsletter', icon: '📬', prompt: 'Generate a Facebook post promoting commercial newsletter. Include: new listings, market analysis, leasing tips, investment opportunities, signup CTA. Company: {company}' }
          ]},
          social_proof: { name: '🏆 Social Proof', templates: [
            { id: 'businesses_helped', name: 'Businesses We\'ve Helped', icon: '🏢', prompt: 'Generate a Facebook post about businesses helped. Include: commercial expertise, successful placements, local knowledge, ready to help your business. Company: {company}' }
          ]}
        }
      }
    }
  },
  healthcare: {
    name: 'Healthcare',
    icon: '🏥',
    description: 'Medical, Dental, Urgent Care, Mental Health & More',
    serviceTypes: {
      dental: {
        name: 'Dental',
        icon: '🦷',
        description: 'Cleanings, Orthodontics, Cosmetic',
        goals: {
          special_offer: {
            name: 'Special Offer',
            templates: [
              { id: 'free_consultation', name: 'Free Consultation', icon: '🎁', prompt: 'Generate a Facebook post for a FREE dental consultation. Include: exam and X-rays included, early detection benefits, what to expect, no-obligation, booking CTA. Company: {company}' },
              { id: 'cleaning_special', name: 'Cleaning Special', icon: '✨', prompt: 'Generate a Facebook post for dental cleaning special. Include: discounted cleaning, gum disease check, oral health assessment, family-friendly, booking CTA. Company: {company}' },
              { id: 'ortho_discount', name: 'Orthodontic Discount', icon: '🦷', prompt: 'Generate a Facebook post for orthodontic treatment discount. Include: straighten teeth, invisalign options, payment plans, smile transformation, consultation CTA. Company: {company}' }
            ]
          },
          value_tips: {
            name: 'Value Tips',
            templates: [
              { id: 'oral_health_tips', name: 'Oral Health Tips', icon: '💡', prompt: 'Generate a Facebook post with oral health tips. Include: brushing technique, flossing importance, diet tips, prevention value, regular checkups. Company: {company}' }
            ]
          },
          cost_saver: {
            name: 'Cost Saver',
            templates: [
              { id: 'prevent_problems', name: 'Prevent Dental Problems', icon: '💰', prompt: 'Generate a Facebook post about preventing costly dental problems. Include: early detection, routine care savings, major treatment costs comparison, preventive value. Company: {company}' }
            ]
          },
          quick_tip: {
            name: 'Quick Tip',
            templates: [
              { id: 'brushing_tips', name: 'Proper Brushing', icon: '⚡', prompt: 'Generate a brief Facebook post about proper brushing technique. Include: frequency, duration, technique, replace toothbrush timing, professional care. Company: {company}' }
            ]
          },
          diy_guide: {
            name: 'DIY Guide',
            templates: [
              { id: 'home_care', name: 'At-Home Dental Care', icon: '🔧', prompt: 'Generate a Facebook post with at-home dental care tips. Include: daily routine, products to use, what to avoid, professional checkup timing. Company: {company}' }
            ]
          },
          warning_post: {
            name: 'Warning Post',
            templates: [
              { id: 'warning_signs', name: 'Dental Warning Signs', icon: '⚠️', prompt: 'Generate a Facebook post about dental warning signs. Include: bleeding gums, tooth sensitivity, bad breath, pain symptoms, urgent care CTA. Company: {company}' }
            ]
          },
          personal_story: {
            name: 'Customer Story',
            templates: [
              { id: 'smile_transformation', name: 'Smile Transformation', icon: '⭐', prompt: 'Generate a Facebook post about patient smile transformation. Include: before/after, patient happiness, confidence restored, consultation CTA. Company: {company}' }
            ]
          },
          local_alert: {
            name: 'Local Alert',
            templates: [
              { id: 'new_patient_welcome', name: 'New Patients Welcome', icon: '📍', prompt: 'Generate a Facebook post welcoming new patients. Include: accepting new patients, insurance accepted, scheduling CTA. Company: {company}' }
            ]
          }
        }
      },
      medical: {
        name: 'Medical',
        icon: '👨‍⚕️',
        description: 'Primary Care, Family Medicine, Urgent Care',
        goals: {
          special_offer: {
            name: 'Special Offer',
            templates: [
              { id: 'new_patient', name: 'New Patient Special', icon: '🎁', prompt: 'Generate a Facebook post for new patient welcome. Include: comprehensive exam, accepting new patients, insurance accepted, convenient scheduling, CTA. Company: {company}' }
            ]
          },
          value_tips: {
            name: 'Value Tips',
            templates: [
              { id: 'wellness_tips', name: 'Wellness Tips', icon: '💡', prompt: 'Generate a Facebook post with general wellness tips. Include: preventive care, healthy lifestyle, annual checkups importance, professional care. Company: {company}' }
            ]
          }
        }
      },
      urgent_care: {
        name: 'Urgent Care',
        icon: '🚑',
        description: 'Walk-In Care, Minor Emergencies',
        goals: {
          special_offer: {
            name: 'Special Offer',
            templates: [
              { id: 'no_wait', name: 'No Appointment Needed', icon: '⚡', prompt: 'Generate a Facebook post about walk-in urgent care. Include: no appointment needed, extended hours, treat minor emergencies, convenient location, walk-in CTA. Company: {company}' }
            ]
          }
        }
      },
      mental_health: {
        name: 'Mental Health',
        icon: '🧠',
        description: 'Therapy, Counseling, Psychiatry',
        goals: {
          special_offer: {
            name: 'Special Offer',
            templates: [
              { id: 'wellness_services', name: 'Mental Wellness Services', icon: '🧘', prompt: 'Generate a Facebook post about mental health services. Include: therapy options, counseling available, insurance accepted, taking care of you, consultation CTA. Company: {company}' }
            ]
          }
        }
      }
    }
  },
  beauty_spa: {
    name: 'Beauty & Spa',
    icon: '💅',
    description: 'Salon, Spa, Nails, Skincare & More',
    serviceTypes: {
      salon: {
        name: 'Hair Salon',
        icon: '💇',
        description: 'Cuts, Color, Styling',
        goals: {
          special_offer: {
            name: 'Special Offer',
            templates: [
              { id: 'color_special', name: 'Color Special', icon: '🎨', prompt: 'Generate a Facebook post for hair coloring special. Include: transform your look, expert colorists, quality products, book now, appointment CTA. Company: {company}' }
            ]
          }
        }
      },
      nails: {
        name: 'Nails',
        icon: '💅',
        description: 'Manicure, Pedicure, Nail Art',
        goals: {
          special_offer: {
            name: 'Special Offer',
            templates: [
              { id: 'mani_pedi', name: 'Mani-Pedi Special', icon: '✨', prompt: 'Generate a Facebook post for mani-pedi special. Include: treat yourself, relaxing experience, gel options, booking CTA. Company: {company}' }
            ]
          }
        }
      }
    }
  },
  fitness: {
    name: 'Fitness & Gym',
    icon: '💪',
    description: 'Gyms, Personal Training, Classes',
    serviceTypes: {
      gym: {
        name: 'Gym',
        icon: '🏋️',
        description: 'Equipment, Facilities, Memberships',
        goals: {
          special_offer: {
            name: 'Special Offer',
            templates: [
              { id: 'join_now', name: 'Join Now Special', icon: '🎁', prompt: 'Generate a Facebook post for gym membership special. Include: join now offer, equipment variety, clean facility, fitness community, tour CTA. Company: {company}' }
            ]
          }
        }
      },
      personal_training: {
        name: 'Personal Training',
        icon: '🏃',
        description: 'One-on-One Training, Coaching',
        goals: {
          special_offer: {
            name: 'Special Offer',
            templates: [
              { id: 'training_special', name: 'Personal Training Special', icon: '💪', prompt: 'Generate a Facebook post for personal training special. Include: achieve your goals, custom programs, experienced trainers, results focus, consultation CTA. Company: {company}' }
            ]
          }
        }
      },
      classes: {
        name: 'Fitness Classes',
        icon: '🧘',
        description: 'Yoga, Zumba, Pilates',
        goals: {
          special_offer: {
            name: 'Special Offer',
            templates: [
              { id: 'class_intro', name: 'Try a Class Free', icon: '🎉', prompt: 'Generate a Facebook post for free class trial. Include: try before you buy, variety of classes, welcoming environment, first class free, CTA. Company: {company}' }
            ]
          }
        }
      }
    }
  },
  restaurant: {
    name: 'Restaurant',
    icon: '🍽️',
    description: 'Dining, Delivery, Catering & More',
    serviceTypes: {
      dining: {
        name: 'Dining',
        icon: '🍴',
        description: 'Eat-In Restaurant',
        goals: {
          special_offer: {
            name: 'Special Offer',
            templates: [
              { id: 'happy_hour', name: 'Happy Hour Special', icon: '🍺', prompt: 'Generate a Facebook post for happy hour special. Include: discounted drinks, appetizer deals, time frame, great atmosphere, visit us CTA. Company: {company}' }
            ]
          }
        }
      },
      delivery: {
        name: 'Delivery',
        icon: '🚗',
        description: 'Takeout, Delivery, Pickup',
        goals: {
          special_offer: {
            name: 'Special Offer',
            templates: [
              { id: 'delivery_special', name: 'Delivery Special', icon: '📦', prompt: 'Generate a Facebook post for delivery special. Include: order online, fast delivery, contactless option, delicious food, order now CTA. Company: {company}' }
            ]
          }
        }
      },
      catering: {
        name: 'Catering',
        icon: '🎉',
        description: 'Events, Parties, Business',
        goals: {
          special_offer: {
            name: 'Special Offer',
            templates: [
              { id: 'event_catering', name: 'Event Catering Available', icon: '🎊', prompt: 'Generate a Facebook post for event catering. Include: weddings, parties, corporate events, menu options, quote CTA. Company: {company}' }
            ]
          }
        }
      }
    }
  },
  retail: {
    name: 'Retail',
    icon: '🛍️',
    description: 'Shopping, Products, Services',
    serviceTypes: {
      clothing: {
        name: 'Clothing',
        icon: '👕',
        description: 'Fashion, Apparel',
        goals: {
          special_offer: {
            name: 'Special Offer',
            templates: [
              { id: 'sale_event', name: 'Sale Event', icon: '🏷️', prompt: 'Generate a Facebook post for sale event. Include: percentage off, select items, limited time, new arrivals, shop now CTA. Company: {company}' }
            ]
          }
        }
      },
      gifts: {
        name: 'Gifts',
        icon: '🎁',
        description: 'Gift Shop, Special Items',
        goals: {
          special_offer: {
            name: 'Special Offer',
            templates: [
              { id: 'gift_guide', name: 'Gift Guide', icon: '🎀', prompt: 'Generate a Facebook post for gift guide. Include: perfect gifts, unique items, gift wrapping, shop local, visit us CTA. Company: {company}' }
            ]
          }
        }
      },
      specialty: {
        name: 'Specialty Products',
        icon: '🛒',
        description: 'Unique Items',
        goals: {
          special_offer: {
            name: 'Special Offer',
            templates: [
              { id: 'new_arrivals', name: 'New Arrivals', icon: '✨', prompt: 'Generate a Facebook post about new arrivals. Include: just in, featured products, limited stock, shop now, CTA. Company: {company}' }
            ]
          }
        }
      },
      home: {
        name: 'Home Goods',
        icon: '🏠',
        description: 'Furniture, Decor',
        goals: {
          special_offer: {
            name: 'Special Offer',
            templates: [
              { id: 'home_decor', name: 'Home Decor Sale', icon: '🖼️', prompt: 'Generate a Facebook post for home decor sale. Include: transform your space, great prices, quality items, in-store only, visit CTA. Company: {company}' }
            ]
          }
        }
      }
    }
  },
  legal: {
    name: 'Legal',
    icon: '⚖️',
    description: 'Law Firms, Attorney Services',
    serviceTypes: {
      family_law: {
        name: 'Family Law',
        icon: '👨‍👩‍👧',
        description: 'Divorce, Custody, Adoption',
        goals: {
          special_offer: {
            name: 'Special Offer',
            templates: [
              { id: 'consultation', name: 'Free Consultation', icon: '📞', prompt: 'Generate a Facebook post for free legal consultation. Include: experienced attorneys, compassionate guidance, your rights, consultation CTA. Company: {company}' }
            ]
          }
        }
      },
      criminal: {
        name: 'Criminal Defense',
        icon: '🛡️',
        description: 'Defense Attorney, Representation',
        goals: {
          special_offer: {
            name: 'Special Offer',
            templates: [
              { id: 'legal_help', name: 'Legal Defense Available', icon: '⚖️', prompt: 'Generate a Facebook post for criminal defense services. Include: experienced defense, protect your rights, legal expertise, consultation CTA. Company: {company}' }
            ]
          }
        }
      },
      personal_injury: {
        name: 'Personal Injury',
        icon: '🚗',
        description: 'Accidents, Claims, Representation',
        goals: {
          special_offer: {
            name: 'Special Offer',
            templates: [
              { id: 'injury_claim', name: 'Injury Claims', icon: '💰', prompt: 'Generate a Facebook post for personal injury services. Include: get compensation you deserve, no fee unless we win, experience matters, consultation CTA. Company: {company}' }
            ]
          }
        }
      }
    }
  },
  financial: {
    name: 'Financial',
    icon: '💰',
    description: 'Banking, Insurance, Investing',
    serviceTypes: {
      banking: {
        name: 'Banking',
        icon: '🏦',
        description: 'Accounts, Loans, Services',
        goals: {
          special_offer: {
            name: 'Special Offer',
            templates: [
              { id: 'account_special', name: 'Account Special', icon: '🎁', prompt: 'Generate a Facebook post for banking account special. Include: open account bonus, competitive rates, local service, convenient locations, visit us CTA. Company: {company}' }
            ]
          }
        }
      },
      insurance: {
        name: 'Insurance',
        icon: '🛡️',
        description: 'Auto, Home, Life',
        goals: {
          special_offer: {
            name: 'Special Offer',
            templates: [
              { id: 'insurance_quote', name: 'Free Insurance Quote', icon: '📋', prompt: 'Generate a Facebook post for free insurance quote. Include: save money, multiple carriers, personalized service, no obligation, quote CTA. Company: {company}' }
            ]
          }
        }
      }
    }
  },
  veterinary: {
    name: 'Veterinary',
    icon: '🐾',
    description: 'Pet Care, Animal Health',
    serviceTypes: {
      pet_care: {
        name: 'Pet Care',
        icon: '🐕',
        description: 'Routine Care, Vaccinations',
        goals: {
          special_offer: {
            name: 'Special Offer',
            templates: [
              { id: 'new_patient', name: 'New Patient Welcome', icon: '🎉', prompt: 'Generate a Facebook post for new pet patient welcome. Include: accepting new patients, experienced vets, caring team, pet health focus, appointment CTA. Company: {company}' }
            ]
          }
        }
      },
      grooming: {
        name: 'Grooming',
        icon: '✂️',
        description: 'Dog Grooming, Spa Services',
        goals: {
          special_offer: {
            name: 'Special Offer',
            templates: [
              { id: 'grooming_special', name: 'Grooming Special', icon: '✨', prompt: 'Generate a Facebook post for pet grooming special. Include: clean and fresh pets, professional groomers, spa services, book appointment CTA. Company: {company}' }
            ]
          }
        }
      }
    }
  },
  education: {
    name: 'Education',
    icon: '📚',
    description: 'Schools, Tutoring, Training',
    serviceTypes: {
      tutoring: {
        name: 'Tutoring',
        icon: '📖',
        description: 'Academic Support, Test Prep',
        goals: {
          special_offer: {
            name: 'Special Offer',
            templates: [
              { id: 'tutoring_special', name: 'Tutoring Special', icon: '🎓', prompt: 'Generate a Facebook post for tutoring special. Include: improve grades, test prep available, experienced tutors, individual attention, consultation CTA. Company: {company}' }
            ]
          }
        }
      },
      training: {
        name: 'Training',
        icon: '🎯',
        description: 'Skills, Professional Development',
        goals: {
          special_offer: {
            name: 'Special Offer',
            templates: [
              { id: 'training_class', name: 'Training Classes', icon: '🏫', prompt: 'Generate a Facebook post for training classes. Include: learn new skills, practical training, certification available, upcoming class, registration CTA. Company: {company}' }
            ]
          }
        }
      },
      enrichment: {
        name: 'Enrichment',
        icon: '🌟',
        description: 'Kids Programs, Camps',
        goals: {
          special_offer: {
            name: 'Special Offer',
            templates: [
              { id: 'kids_programs', name: 'Kids Programs', icon: '👶', prompt: 'Generate a Facebook post for kids enrichment programs. Include: fun learning, ages served, upcoming programs, register now CTA. Company: {company}' }
            ]
          }
        }
      }
    }
  },
  marketing: {
    name: 'Marketing',
    icon: '📢',
    description: 'Digital Marketing, Advertising Services',
    serviceTypes: {
      digital: {
        name: 'Digital Marketing',
        icon: '💻',
        description: 'SEO, Social Media, Online Ads',
        goals: {
          special_offer: {
            name: 'Special Offer',
            templates: [
              { id: 'marketing_consult', name: 'Free Marketing Consultation', icon: '🎯', prompt: 'Generate a Facebook post for free marketing consultation. Include: grow your business, online presence, proven strategies, no-obligation, consultation CTA. Company: {company}' }
            ]
          }
        }
      },
      advertising: {
        name: 'Advertising',
        icon: '📺',
        description: 'Creative, Media Buying',
        goals: {
          special_offer: {
            name: 'Special Offer',
            templates: [
              { id: 'ad_campaign', name: 'Ad Campaign Special', icon: '📊', prompt: 'Generate a Facebook post for advertising campaign special. Include: reach more customers, effective campaigns, track results, growth focused, consultation CTA. Company: {company}' }
            ]
          }
        }
      },
      branding: {
        name: 'Branding',
        icon: '🎨',
        description: 'Logo, Brand Identity',
        goals: {
          special_offer: {
            name: 'Special Offer',
            templates: [
              { id: 'branding_package', name: 'Branding Package', icon: '✨', prompt: 'Generate a Facebook post for branding package. Include: professional identity, logo design, brand guidelines, elevate your business, consultation CTA. Company: {company}' }
            ]
          }
        }
      }
    }
  },
  emergency: {
    name: 'Emergency',
    icon: '🚨',
    description: 'Emergency Services, Support',
    serviceTypes: {
      medical_emergency: {
        name: 'Medical Emergency',
        icon: '🚑',
        description: 'Urgent Medical Care',
        goals: {
          special_offer: {
            name: 'Special Offer',
            templates: [
              { id: 'emergency_services', name: 'Emergency Services', icon: '⚡', prompt: 'Generate a Facebook post for emergency medical services. Include: 24/7 availability, urgent care, experienced team, life-saving services, call CTA. Company: {company}' }
            ]
          }
        }
      },
      emergency_repair: {
        name: 'Emergency Repair',
        icon: '🛠️',
        description: '24/7 Repair Services',
        goals: {
          special_offer: {
            name: 'Special Offer',
            templates: [
              { id: '24_7_repair', name: '24/7 Emergency Repair', icon: '⚠️', prompt: 'Generate a Facebook post for 24/7 emergency repair services. Include: available anytime, fast response, prevent damage, experienced technicians, call now CTA. Company: {company}' }
            ]
          }
        }
      }
    }
  },
  payment_billing: {
    name: 'Payment & Billing',
    icon: '💳',
    description: 'Billing Services, Payment Processing',
    serviceTypes: {
      billing: {
        name: 'Billing Services',
        icon: '📄',
        description: 'Medical Billing, Invoicing',
        goals: {
          special_offer: {
            name: 'Special Offer',
            templates: [
              { id: 'billing_services', name: 'Billing Services', icon: '📊', prompt: 'Generate a Facebook post for billing services. Include: streamline billing, reduce errors, faster payments, expert team, consultation CTA. Company: {company}' }
            ]
          }
        }
      },
      payment_processing: {
        name: 'Payment Processing',
        icon: '💳',
        description: 'Credit Card Processing, POS',
        goals: {
          special_offer: {
            name: 'Special Offer',
            templates: [
              { id: 'payment_system', name: 'Payment Processing Special', icon: '💵', prompt: 'Generate a Facebook post for payment processing special. Include: accept all cards, low rates, secure processing, easy setup, consultation CTA. Company: {company}' }
            ]
          }
        }
      },
      collections: {
        name: 'Collections',
        icon: '📞',
        description: 'Account Management, Recovery',
        goals: {
          special_offer: {
            name: 'Special Offer',
            templates: [
              { id: 'collections_service', name: 'Collections Services', icon: '📋', prompt: 'Generate a Facebook post for collections services. Include: improve cash flow, professional approach, compliance focused, recovery expertise, consultation CTA. Company: {company}' }
            ]
          }
        }
      }
    }
  },
  appointments: {
    name: 'Appointments',
    icon: '📅',
    description: 'Scheduling, Booking Services',
    serviceTypes: {
      scheduling: {
        name: 'Scheduling Software',
        icon: '🗓️',
        description: 'Online Booking, Calendar',
        goals: {
          special_offer: {
            name: 'Special Offer',
            templates: [
              { id: 'booking_system', name: 'Online Booking System', icon: '📱', prompt: 'Generate a Facebook post for online booking system. Include: 24/7 booking, reduce no-shows, automated reminders, easy setup, demo CTA. Company: {company}' }
            ]
          }
        }
      },
      appointment_reminders: {
        name: 'Appointment Reminders',
        icon: '🔔',
        description: 'Automated Reminders',
        goals: {
          special_offer: {
            name: 'Special Offer',
            templates: [
              { id: 'reminder_service', name: 'Automated Reminders', icon: '⏰', prompt: 'Generate a Facebook post for automated appointment reminders. Include: reduce no-shows, text/email reminders, customizable, save time, demo CTA. Company: {company}' }
            ]
          }
        }
      },
      consultation: {
        name: 'Consultation Booking',
        icon: '👔',
        description: 'Professional Consultations',
        goals: {
          special_offer: {
            name: 'Special Offer',
            templates: [
              { id: 'consult_booking', name: 'Book Consultation', icon: '📞', prompt: 'Generate a Facebook post for consultation booking. Include: expert advice, convenient scheduling, flexible times, book online, CTA. Company: {company}' }
            ]
          }
        }
      }
    }
  },
  customer_service: {
    name: 'Customer Service',
    icon: '🎧',
    description: 'Support, Call Centers',
    serviceTypes: {
      support: {
        name: 'Support Services',
        icon: '🤝',
        description: 'Help Desk, Technical Support',
        goals: {
          special_offer: {
            name: 'Special Offer',
            templates: [
              { id: 'support_service', name: 'Customer Support Available', icon: '💬', prompt: 'Generate a Facebook post for customer support services. Include: always available, helpful team, quick resolution, satisfaction focused, contact us CTA. Company: {company}' }
            ]
          }
        }
      },
      call_center: {
        name: 'Call Center',
        icon: '📞',
        description: 'Inbound, Outbound',
        goals: {
          special_offer: {
            name: 'Special Offer',
            templates: [
              { id: 'call_center_service', name: 'Call Center Services', icon: '☎️', prompt: 'Generate a Facebook post for call center services. Include: professional team, extended hours, handle inquiries, quality service, consultation CTA. Company: {company}' }
            ]
          }
        }
      },
      live_chat: {
        name: 'Live Chat',
        icon: '💬',
        description: 'Online Chat Support',
        goals: {
          special_offer: {
            name: 'Special Offer',
            templates: [
              { id: 'live_chat_service', name: 'Live Chat Support', icon: '📱', prompt: 'Generate a Facebook post for live chat support. Include: instant help, 24/7 available, quick answers, customer satisfaction, try now CTA. Company: {company}' }
            ]
          }
        }
      }
    }
  }
}

