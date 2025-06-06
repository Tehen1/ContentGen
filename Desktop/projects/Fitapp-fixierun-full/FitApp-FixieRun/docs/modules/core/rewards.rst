Rewards Module
=============

.. automodule:: fixie_run.core.rewards
   :members:
   :undoc-members:
   :show-inheritance:

Overview
--------

The Rewards module is responsible for calculating token rewards based on cycling activity metrics. It uses a model that rewards users based on:

* Base rewards for each activity
* Distance-based rewards scaled by kilometers cycled
* Time-based rewards scaled by hours spent cycling
* Weekly challenge bonuses for achieving specific goals

Classes
-------

ActivityData
^^^^^^^^^^^

.. autoclass:: fixie_run.core.rewards.ActivityData
   :members:
   :undoc-members:

The ``ActivityData`` class is a data container that holds cycling metrics needed for reward calculations.

RewardBreakdown
^^^^^^^^^^^^^^

.. autoclass:: fixie_run.core.rewards.RewardBreakdown
   :members:
   :undoc-members:

The ``RewardBreakdown`` class represents the detailed breakdown of calculated rewards.

Functions
---------

calculate_rewards
^^^^^^^^^^^^^^^

.. autofunction:: fixie_run.core.rewards.calculate_rewards

This is the main function for calculating token rewards based on cycling activity data.

rewards_to_dict
^^^^^^^^^^^^^

.. autofunction:: fixie_run.core.rewards.rewards_to_dict

Converts a ``RewardBreakdown`` object to a dictionary for serialization.

calculate_reward_tier
^^^^^^^^^^^^^^^^^^^

.. autofunction:: fixie_run.core.rewards.calculate_reward_tier

Determines the user's reward tier based on total distance cycled.

Examples
--------

Basic Reward Calculation
^^^^^^^^^^^^^^^^^^^^^^

.. code-block:: python

   from fixie_run.core.rewards import ActivityData, calculate_rewards

   # Create activity data
   activity = ActivityData(
       distance_km=25.0,
       duration_hours=2.0,
       elevation_m=150.0
   )

   # Calculate rewards
   rewards = calculate_rewards(activity)

   # Print total rewards
   print(f"Total rewards: {rewards.total} FIXIE tokens")

   # Get reward tier
   tier = calculate_reward_tier(activity.distance_km)
   print(f"Reward tier: {tier}")