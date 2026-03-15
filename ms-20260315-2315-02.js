"""
AI-Driven Niche Manuscript Style Consistency Checker

This utility helps maintain stylistic consistency in specialized academic or
technical manuscripts. It identifies subtle inconsistencies in writing style,
tone, and terminology that are unique to specific niches (e.g., medical
research, legal documents). The tool learns the stylistic conventions of a
given niche to provide targeted feedback and suggestions.

This is an AI-generated tool by Autonomous Wealth Engine.

Usage:
    python style_checker.py <input_file> [--output-file <output_file>] [--learn <style_guide_file>] [--check-style <niche>] [--suggest-corrections]

Arguments:
    input_file (str): The path to the manuscript file to check.

Options:
    --output-file (str): The path to save the consistency report. If not
                         provided, the report will be printed to the console.
    --learn (str): A path to a reference style guide file for a specific niche.
                   This file will be used to build a profile of the niche's
                   style conventions. The format of this file is assumed to
                   be a plain text file where each line represents a typical
                   stylistic element or terminology preferred in the niche.
                   Example: "medical_style.txt" with lines like:
                   "use 'patient' not 'subject'"
                   "prefer 'cardiovascular' over 'heart-related'"
                   "avoid colloquialisms"
    --check-style (str): The name of the niche to check against. This option
                         uses pre-defined or learned style profiles. If a
                         learned profile exists for this niche (e.g., from
                         --learn), it will be used. Otherwise, a generic
                         set of checks might be applied if available.
    --suggest-corrections (bool): If specified, the tool will suggest possible
                                corrections for identified inconsistencies.

Revenue Target: $600/month (as per project specification)

Example:
    # Check a medical manuscript and save the report
    python style_checker.py manuscript.txt --output-file report.txt --check-style medical --suggest-corrections

    # Learn a style guide for legal briefs
    python style_checker.py --learn legal_style_guide.txt --check-style legal

    # Check a manuscript against a learned legal style
    python style_checker.py brief.txt --check-style legal --suggest-corrections
"""

import argparse
import re
import os

# --- Style Profiles ---
# In a real-world scenario, these would be more sophisticated, potentially
# involving NLP models. For this stdlib-only implementation, we use simple
# keyword-based rules and learned patterns.

# A dictionary to store learned style profiles.
# Key: niche name (str)
# Value: a dictionary with 'rules' (list of tuples) and 'vocabulary' (set)
learned_styles = {}

def load_learned_style(niche_name, style_guide_file):
    """Loads style rules and vocabulary from a given file."""
    if not os.path.exists(style_guide_file):
        print(f"Error: Style guide file not found at '{style_guide_file}'")
        return False

    rules = []
    vocabulary = set()

    with open(style_guide_file, 'r', encoding='utf-8') as f:
        for line in f:
            line = line.strip()
            if not line or line.startswith('#'): # Ignore empty lines and comments
                continue

            # Simple rule parsing:
            # - "use 'term1' not 'term2'" -> identifies forbidden terms and their alternatives
            # - "prefer 'term1'" -> identifies preferred terms
            # - "avoid 'colloquialism'" -> identifies terms to avoid
            match_forbidden = re.match(r"use '(.+?)' not '(.+?)'", line)
            match_prefer = re.match(r"prefer '(.+?)'", line)
            match_avoid = re.match(r"avoid '(.+?)'", line)

            if match_forbidden:
                preferred, forbidden = match_forbidden.groups()
                rules.append(('forbidden_term', preferred, forbidden))
                vocabulary.add(preferred)
                vocabulary.add(forbidden)
            elif match_prefer:
                preferred = match_prefer.group(1)
                rules.append(('preferred_term', preferred))
                vocabulary.add(preferred)
            elif match_avoid:
                avoid_term = match_avoid.group(1)
                rules.append(('avoid_term', avoid_term))
                vocabulary.add(avoid_term)
            else:
                # Treat other lines as potentially useful vocabulary or general guidelines
                # For simplicity, we'll just add them as general vocabulary here
                vocabulary.add(line)

    learned_styles[niche_name] = {'rules': rules, 'vocabulary': vocabulary}
    print(f"Successfully learned style for '{niche_name}' from '{style_guide_file}'.")
    return True

def get_style_rules(niche_name):
    """Retrieves style rules for a given niche."""
    # In a real implementation, this would also load from persistent storage
    # or a predefined set if no learned style exists.
    if niche_name in learned_styles:
        return learned_styles[niche_name]['rules']
    else:
        # Placeholder for pre-defined styles
        print(f"Warning: No specific style profile learned for '{niche_name}'. Using generic checks.")
        return generic_style_rules

generic_style_rules = [
    # Example of a generic rule: avoid contractions in formal writing
    ('avoid_pattern', r"(?:\w+'\w+)", "contractions"),
    # Example: Prefer consistent phrasing for common concepts (simplified)
    ('alternative_phrasing', 'data shows', 'the data shows'),
    ('alternative_phrasing', 'significant decrease', 'marked decrease'),
]

def check_consistency(text, style_rules, suggest_corrections=False):
    """
    Checks the text against the provided style rules.
    Returns a list of detected inconsistencies.
    """
    inconsistencies = []
    lines = text.splitlines()

    for line_num, line in enumerate(lines, 1):
        for rule_type, *rule_params in style_rules:
            if rule_type == 'forbidden_term':
                preferred, forbidden = rule_params
                # Case-insensitive search for forbidden term
                if re.search(r'\b' + re.escape(forbidden) + r'\b', line, re.IGNORECASE):
                    message = f"Line {line_num}: Potential inconsistency - '{forbidden}' used. Consider using '{preferred}'."
                    if suggest_corrections:
                        correction = re.sub(r'\b' + re.escape(forbidden) + r'\b', preferred, line, flags=re.IGNORECASE)
                        message += f"\n  Suggestion: '{correction}'"
                    inconsistencies.append(message)
            elif rule_type == 'preferred_term':
                preferred = rule_params[0]
                # This rule is harder to check automatically without context.
                # A simple check could be to ensure it's used if a related term is.
                # For now, we'll flag if common alternatives are used.
                # This is a simplification for stdlib-only.
                pass # Placeholder for more complex preferred term checks
            elif rule_type == 'avoid_term':
                avoid_term = rule_params[0]
                if re.search(r'\b' + re.escape(avoid_term) + r'\b', line, re.IGNORECASE):
                    message = f"Line {line_num}: Potential inconsistency - '{avoid_term}' used. This term is often avoided in this niche."
                    if suggest_corrections:
                        message += "\n  Suggestion: Rephrase or use an alternative."
                    inconsistencies.append(message)
            elif rule_type == 'avoid_pattern':
                pattern, description = rule_params
                if re.search(pattern, line):
                    message = f"Line {line_num}: Potential stylistic issue - {description} detected ('{re.search(pattern, line).group(0)}')."
                    if suggest_corrections:
                        # This is very basic, doesn't actually correct
                        message += "\n  Suggestion: Review for appropriate usage or rephrase."
                    inconsistencies.append(message)
            elif rule_type == 'alternative_phrasing':
                original_phrase, suggested_phrase = rule_params
                # Simple check: if the original phrase is present, it might be an inconsistency
                # if the suggested phrase is more standard for the niche.
                # This requires more context and a more robust NLP approach for true accuracy.
                # Here, we'll flag if the 'original' is found, implying a potential
                # opportunity to use the 'suggested' one.
                if re.search(r'\b' + re.escape(original_phrase) + r'\b', line, re.IGNORECASE):
                    message = f"Line {line_num}: Potential phrasing inconsistency - '{original_phrase}' found. Consider using '{suggested_phrase}'."
                    if suggest_corrections:
                        correction = re.sub(r'\b' + re.escape(original_phrase) + r'\b', suggested_phrase, line, flags=re.IGNORECASE)
                        message += f"\n  Suggestion: '{correction}'"
                    inconsistencies.append(message)

    return inconsistencies

def main():
    parser = argparse.ArgumentParser(
        description="AI-Driven Niche Manuscript Style Consistency Checker. Helps identify and correct subtle inconsistencies in specialized writing.",
        formatter_class=argparse.RawTextHelpFormatter
    )

    parser.add_argument(
        "input_file",
        help="The path to the manuscript file to check."
    )
    parser.add_argument(
        "--output-file",
        help="The path to save the consistency report. If not provided, the report will be printed to the console.",
        default=None
    )
    parser.add_argument(
        "--learn",
        help="A path to a reference style guide file for a specific niche to learn its conventions.",
        default=None
    )
    parser.add_argument(
        "--check-style",
        help="The name of the niche to check against. Uses pre-defined or learned style profiles.",
        default=None
    )
    parser.add_argument(
        "--suggest-corrections",
        action="store_true",
        help="If specified, the tool will suggest possible corrections for identified inconsistencies."
    )

    args = parser.parse_args()

    if args.learn and args.check_style:
        if not load_learned_style(args.check_style, args.learn):
            return # Error loading style guide

    if not args.check_style:
        print("Error: --check-style is required to specify the niche for checking.")
        parser.print_help()
        return

    try:
        with open(args.input_file, 'r', encoding='utf-8') as f:
            manuscript_text = f.read()
    except FileNotFoundError:
        print(f"Error: Input file not found at '{args.input_file}'")
        return
    except Exception as e:
        print(f"Error reading input file: {e}")
        return

    style_rules = get_style_rules(args.check_style)
    inconsistencies = check_consistency(manuscript_text, style_rules, args.suggest_corrections)

    report_lines = []
    report_lines.append(f"Style Consistency Report for: {args.input_file}")
    report_lines.append(f"Niche: {args.check_style}")
    report_lines.append("-" * 50)

    if not inconsistencies:
        report_lines.append("No significant style inconsistencies found.")
    else:
        report_lines.append(f"Found {len(inconsistencies)} potential inconsistencies:\n")
        for item in inconsistencies:
            report_lines.append(item)
            report_lines.append("-" * 20)

    report_output = "\n".join(report_lines)

    if args.output_file:
        try:
            with open(args.output_file, 'w', encoding='utf-8') as f:
                f.write(report_output)
            print(f"Report saved to '{args.output_file}'")
        except Exception as e:
            print(f"Error saving report to '{args.output_file}': {e}")
    else:
        print(report_output)

if __name__ == '__main__':
    main()