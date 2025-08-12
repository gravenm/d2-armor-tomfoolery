import pandas as pd
import logging
from itertools import combinations
import colorlog
import argparse
import json
import base64


logger = logging.getLogger(__name__)
logger.setLevel(logging.DEBUG)

handler = logging.StreamHandler()
formatter = colorlog.ColoredFormatter(
    '%(log_color)s%(levelname)-8s%(reset)s %(message)s',
    log_colors={
        'DEBUG': 'cyan',
        'INFO': 'green',
        'WARNING': 'yellow',
        'ERROR': 'red',
        'CRITICAL': 'bold_red',
    }
)
handler.setFormatter(formatter)
logger.addHandler(handler)

# Load the armor data from a CSV file
# Replace 'your_armor_data.csv' with the actual path to your file
try:
    armor_df = pd.read_csv("destiny-armor.csv")
    logger.info("Armor data loaded successfully!")
except FileNotFoundError:
    logger.error(
        "Error: 'your_armor_data.csv' not found. Please provide the correct path to your file."
    )
except Exception as e:
    logger.error(f"An error occurred: {e}")

weighting_criteria = [
    "Total Stats",
    "Specific Stat Spikes",
    "Tier",
    "Archetype Pairing",
    "Bonus for Stats Not Matching Archetype",
]

# Adjust weights based on review of results
weights = {
    "BST": 1.0,  # Base Stat Total (Global)
    "Artiface": 1.0,  # Artiface Slot (Global)
}

# Define archetype specific weights (example values based on planning)
archetype_weights = {
    "Bulwark": 1.1,
    "Brawler": 1.6,
    "Gunner": 1.6,
    "Specialist": 1.6,
    "Grenadier": 1.6,
    "Paragon": 1.6,    
    # Add weights for other archetypes as needed
}

archetypes = {
    "Brawler":{
        "Primary": "Melee (Base)",
        "Secondary": "Health (Base)"
    },
    "Gunner":{
        "Primary": "Weapons (Base)",
        "Secondary": "Grenade (Base)"
    },
    "Specialist":{
        "Primary": "Class (Base)",
        "Secondary": "Weapons (Base)"
    },
    "Grenadier":{
        "Primary": "Grenade (Base)",
        "Secondary": "Super (Base)"
    },
    "Paragon":{
        "Primary": "Weapons (Base)",
        "Secondary": "Melee (Base)"
    },
    "Bulwark":{
        "Primary": "Health (Base)",
        "Secondary": "Class (Base)"
    }
}

# Define tier specific weights (example values based on planning)
tier_weights = {
    "Tier 1": {"low": 1.0, "high": 1.05},
    "Tier 2": {"low": 1.1, "high": 1.15},
    "Tier 3": {"low": 1.2, "high": 1.25},
    "Tier 4": {"low": 1.3, "high": 1.35},
    "Tier 5": {"low": 1.5, "high": 1.55},
}

tiers = {
    "Tier 1": [52, 57],
    "Tier 2": [58, 63],
    "Tier 3": [64, 69],
    "Tier 4": [70, 75],
    "Tier 5": [75, 81]
}
# Define specific weights for illegal combos (example values - adjust as needed)
illegal_combo_weights = {
    ("Grenade (Base)", "Health (Base)"): 1.5,
    ("Health (Base)", "Super (Base)"): 1.5,
    ("Health (Base)", "Weapons (Base)"): 1.8,
    ("Grenade (Base)", "Melee (Base)"): 2.0,
    ("Melee (Base)", "Super (Base)"): 2.0,
    ("Class (Base)", "Melee (Base)"): 2.0,
    ("Class (Base)", "Grenade (Base)"): 1.5,
    ("Class (Base)", "Super (Base)"): 1.5,
    ("Super (Base)", "Weapons (Base)"): 1.8,
}

stats = ['Health (Base)','Melee (Base)','Grenade (Base)','Super (Base)','Class (Base)','Weapons (Base)',]

def main():
    parser = argparse.ArgumentParser(description='Calculate armor weights.')
    parser.add_argument('--weights', type=str, help='JSON string of custom weights')
    args = parser.parse_args()

    global weights, archetype_weights, tier_weights, illegal_combo_weights
    if args.weights:
        decoded_weights = base64.b64decode(args.weights).decode('utf-8')
        custom_weights = json.loads(decoded_weights)
        weights.update(custom_weights.get('general', {}))
        archetype_weights.update(custom_weights.get('archetype', {}))
        
        custom_tier_weights = custom_weights.get('tier', {})
        for tier, values in custom_tier_weights.items():
            if not values.get('enabled', True):
                tier_weights[tier] = {'low': 1.0, 'high': 1.0}
            else:
                tier_weights[tier] = {'low': values['low'], 'high': values['high']}

        custom_illegal_combo_weights = custom_weights.get('illegal_combo', {})
        for combo_str, value in custom_illegal_combo_weights.items():
            combo = tuple(combo_str.split(','))
            sorted_combo = tuple(sorted(combo))
            illegal_combo_weights[sorted_combo] = value

def calculate_armor_weight(
    armor_piece, weights, archetype_weights, tier_weights, illegal_combo_weights
):
    """
    Calculates the weight of an armor piece based on defined criteria.

    Args:
        armor_piece (pd.Series): A row from the armor_df DataFrame representing
                                 a single armor piece.
        weights (dict): A dictionary containing the general weights for criteria.
        archetype_weights (dict): A dictionary containing weights for specific archetypes.
        tier_weights (dict): A dictionary containing weights for specific tiers.
        illegal_combo_weights (dict): A dictionary containing weights for specific illegal stat combinations.

    Returns:
        float: The calculated weight of the armor piece.
    """
    weight = 0
    logger.debug(f"Processing armor piece: {armor_piece['Name']} ({armor_piece['Id']})")

    # 1. Total Stats (Using BST weight as per planning)
    bst_weight = armor_piece["Total (Base)"] * weights["BST"]
    weight += bst_weight
    logger.debug(f"  - BST Weight: {bst_weight:.2f} (Total Base: {armor_piece['Total (Base)']}). Current Total Weight: {weight:.2f}")

    # 2. Artiface Slot (Assuming a column indicates artiface slot, if not, this needs adjustment)
    if "Artiface" in armor_piece and armor_piece["Artiface"]:
        weight += weights["Artiface"]
        logger.debug(f"  - Artiface Bonus: {weights['Artiface']}. Current Total Weight: {weight:.2f}")
    # If 'Artiface' is a numeric column representing a value:
    # weight += armor_piece['Artiface'] * weights['Artiface']

    # Tier-specific logic
    if armor_piece['Tier'] == 0:
        # Logic for Tier 0 (Armor 2.0)
        # Apply illegal combo weights
        armor_stat_combinations = list(combinations(stats, 2))
        for combo in armor_stat_combinations:
            sorted_combo = tuple(sorted(combo))
            if (
                sorted_combo in illegal_combo_weights
                and armor_piece[combo[0]] > 15
                and armor_piece[combo[1]] > 15
            ):
                combo_weight = illegal_combo_weights[sorted_combo]
                weight += combo_weight
                logger.debug(f"  - Illegal Combo Bonus: {combo_weight:.2f} for {sorted_combo}. Current Total Weight: {weight:.2f}")
    elif armor_piece['Tier'] in [1, 2, 3, 4, 5]:
        # Logic for Tiers 1-5
        tier_name = f"Tier {armor_piece['Tier']}"
        if tier_name in tier_weights and tier_name in tiers:
            tier_range = tiers[tier_name]
            min_stat, max_stat = tier_range[0], tier_range[1]
            midpoint = (min_stat + max_stat) / 2
            armor_total_base = armor_piece["Total (Base)"]
            tier_weight_config = tier_weights[tier_name]
            
            if armor_total_base < midpoint:
                tier_weight_bonus = tier_weight_config["low"]
            else:
                tier_weight_bonus = tier_weight_config["high"]
            
            weight += tier_weight_bonus
            logger.debug(f"  - Tier Bonus: {tier_weight_bonus:.2f} for {tier_name}. Current Total Weight: {weight:.2f}")

    # 5. Specific Stat Spikes
    if armor_piece["Total (Base)"] > 0:
        sorted_stats = armor_piece[stats].sort_values(ascending=False)
        top_two_stats_names = tuple(sorted(sorted_stats.index[:2].tolist()))
        
        matching_archetype = None
        for archetype_name, archetype_pairing in archetypes.items():
            if top_two_stats_names == tuple(sorted([archetype_pairing["Primary"], archetype_pairing["Secondary"]])):
                matching_archetype = archetype_name
                break
        
        other_stats_avg = sorted_stats[2:].mean()
        spike_threshold = 10  # Configurable threshold

        if (sorted_stats[:2] > other_stats_avg + spike_threshold).all():
            if matching_archetype and matching_archetype in archetype_weights:
                spike_bonus = archetype_weights[matching_archetype]
                logger.debug(f"  - Archetype Spike Bonus: {spike_bonus:.2f} for {matching_archetype}. Current Total Weight: {weight + spike_bonus:.2f}")
                weight += spike_bonus
    
    logger.info(f"Final calculated weight for {armor_piece['Name']} ({armor_piece['Id']}): {weight:.2f}")
    return weight


armor_df["Armor_Weight"] = armor_df.apply(
    calculate_armor_weight,
    axis=1,
    weights=weights,
    archetype_weights=archetype_weights,
    tier_weights=tier_weights,
    illegal_combo_weights=illegal_combo_weights,
)


# Sort the DataFrame by 'Armor_Weight' in descending order
ranked_armor_df = armor_df.sort_values(by='Armor_Weight', ascending=False)

# Calculate the average weight per class
average_weight_by_class = armor_df.groupby('Equippable')['Armor_Weight'].mean()
logger.info("Average Weight by Class:")
logger.info(average_weight_by_class)

# Calculate the count of armor pieces per class
length_weight_by_class = armor_df.groupby('Equippable')['Armor_Weight'].count()
logger.info("\nTotal Armor Pieces by Class:")
logger.info(length_weight_by_class)

all_armor_by_class = {}

for equippable_class in ranked_armor_df['Equippable'].unique():
    class_armor = ranked_armor_df[ranked_armor_df['Equippable'] == equippable_class]
    all_armor_by_class[equippable_class] = {
        'stats': {
            'total_count': len(class_armor),
            'average_weight': average_weight_by_class[equippable_class]
        },
        'armor': class_armor[['Id','Name','Tier', 'Equippable', 'Total', 'Armor_Weight']].to_dict('records')
    }

print(json.dumps(all_armor_by_class))

if __name__ == "__main__":
    main()
