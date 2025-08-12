# Destiny 2 Armor Evaluator

This script evaluates and ranks Destiny 2 armor pieces based on a customizable weighted system. It is designed to help players identify their best armor by considering a variety of factors, including base stats, tier, artifice bonuses, and specific stat combinations.

## Features

The script uses a sophisticated weighting system that can be tailored to your specific preferences. The key evaluation criteria include:

-   **Base Stat Total (BST)**: The fundamental measure of an armor piece's quality.
-   **Artifice Armor Bonus**: A flat bonus for artifice armor, which provides an extra stat slot.
-   **Tier-Based Weighting (Armor 3.0)**: Armor is evaluated based on its tier (1-5), with a distinction between pieces on the lower and higher end of their stat range.
-   **Illegal Stat Combos (Armor 2.0)**: A special bonus for legacy Armor 2.0 pieces with rare "illegal" stat combinations that are no longer attainable. This bonus is only applied if both stats in the combination are over 15.
-   **Archetype-Driven Spikes**: A bonus for armor with stat spikes that align with predefined archetypes (e.g., "Brawler," "Grenadier"). This rewards armor that is specialized for a particular playstyle.

## Setup and Usage

### Prerequisites

-   Python 3.x
-   `pandas`
-   `colorlog`

You can install the required Python packages using pip:

```bash
pip install pandas colorlog
```

### Data File

The script requires a `destiny-armor.csv` file in the same directory. This file should contain your armor data, with columns for stats, tier, and other relevant information. An example of the required format can be found in the provided `destiny-armor.csv`.

### Execution

To run the script, simply execute the following command in your terminal:

```bash
python main.py
```

## Configuration

The script's behavior can be customized by modifying the weight dictionaries at the top of `main.py`:

-   `weights`: Global weights for core attributes like BST and the base bonus for different categories.
-   `archetype_weights`: The bonus applied for armor that has a stat spike matching a defined archetype.
-   `tier_weights`: The "low" and "high" weights for each armor tier (1-5).
-   `illegal_combo_weights`: The bonus for specific "illegal" stat combinations on Armor 2.0 pieces.

## Output

The script generates the following files:

-   `armor_evaluation.log`: A detailed log of the entire evaluation process, including a step-by-step breakdown of the weight calculation for each armor piece.
-   `*-weighted.csv` (e.g., `Hunter-weighted.csv`): A CSV file for each class, containing a list of armor pieces that are below the average weight for that class. This is useful for identifying underperforming gear.
