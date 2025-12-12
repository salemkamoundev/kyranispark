#!/bin/bash

# Script de concaténation des fichiers source Angular
# Date: 2025-10-18

OUTPUT_FILE="project-concatenated.txt"
PROJECT_DIR="./src"

echo "======================================"
echo "  Concaténation projet Angular"
echo "======================================"
echo ""

# Vérifier que le dossier src existe
if [ ! -d "$PROJECT_DIR" ]; then
    echo "❌ Dossier src non trouvé"
    exit 1
fi

# Supprimer l'ancien fichier de sortie
rm -f "$OUTPUT_FILE"

# Créer l'en-tête
cat > "$OUTPUT_FILE" << EOF
====================================
  Projet Angular - Code Source
  Date: $(date)
====================================

Arborescence du projet:
EOF

# Ajouter l'arborescence
echo "" >> "$OUTPUT_FILE"
tree -I 'node_modules|dist|.angular|*.spec.ts' "$PROJECT_DIR" >> "$OUTPUT_FILE" 2>/dev/null || find "$PROJECT_DIR" -type f | sort >> "$OUTPUT_FILE"

echo "" >> "$OUTPUT_FILE"
echo "====================================" >> "$OUTPUT_FILE"
echo "  FICHIERS SOURCE" >> "$OUTPUT_FILE"
echo "====================================" >> "$OUTPUT_FILE"
echo "" >> "$OUTPUT_FILE"

# Compteurs
total_files=0
total_lines=0

# Extensions à inclure
extensions=("ts" "html" "scss" "css" "json")

# Parcourir tous les fichiers
for ext in "${extensions[@]}"; do
    while IFS= read -r file; do
        # Exclure les fichiers de test et spec
        if [[ "$file" == *".spec."* ]] || [[ "$file" == *".backup"* ]] || [[ "$file" == *".tmp"* ]]; then
            continue
        fi
        
        # Calculer le nombre de lignes
        lines=$(wc -l < "$file" 2>/dev/null || echo 0)
        
        # Ajouter le séparateur et le nom du fichier
        echo "" >> "$OUTPUT_FILE"
        echo "====================================" >> "$OUTPUT_FILE"
        echo "FICHIER: $file" >> "$OUTPUT_FILE"
        echo "Lignes: $lines" >> "$OUTPUT_FILE"
        echo "====================================" >> "$OUTPUT_FILE"
        echo "" >> "$OUTPUT_FILE"
        
        # Ajouter le contenu du fichier
        cat "$file" >> "$OUTPUT_FILE" 2>/dev/null
        
        # Mettre à jour les compteurs
        ((total_files++))
        ((total_lines+=lines))
        
        # Afficher la progression
        echo "✓ $file ($lines lignes)"
        
    done < <(find "$PROJECT_DIR" -name "*.$ext" -type f | sort)
done

# Ajouter le résumé à la fin
cat >> "$OUTPUT_FILE" << EOF


====================================
  RÉSUMÉ
====================================
Total fichiers: $total_files
Total lignes: $total_lines
Date: $(date)
====================================
EOF

echo ""
echo "======================================"
echo "✓ CONCATÉNATION TERMINÉE!"
echo "======================================"
echo ""
echo "Statistiques:"
echo "  Fichiers traités: $total_files"
echo "  Lignes totales: $total_lines"
echo "  Fichier de sortie: $OUTPUT_FILE"
echo ""
echo "Taille du fichier:"
du -h "$OUTPUT_FILE"
echo ""
echo "Pour voir le fichier:"
echo "  cat $OUTPUT_FILE"
echo "  less $OUTPUT_FILE"
echo "  nano $OUTPUT_FILE"
