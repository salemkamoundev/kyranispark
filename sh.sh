# 1. Annuler tous les changements
git checkout -- src/app/

# 2. Supprimer les imports incorrects des composants admin
find src/app/components/admin-dashboard -name "*.ts" -type f -exec sed -i.bak '/import.*FooterComponent.*from.*components\/footer/d' {} \;
find src/app/components/admin-dashboard -name "*.bak" -delete

# 3. Supprimer FooterComponent des imports des composants admin
find src/app/components/admin-dashboard -name "*.ts" -type f -exec sed -i.bak 's/, FooterComponent//g; s/FooterComponent, //g; s/FooterComponent//g' {} \;
find src/app/components/admin-dashboard -name "*.bak" -delete

# 4. Supprimer <app-footer> du HTML des composants admin
find src/app/components/admin-dashboard -name "*.html" -type f -exec sed -i.bak '/<app-footer><\/app-footer>/d' {} \;
find src/app/components/admin-dashboard -name "*.bak" -delete

# 5. Ajouter le footer SEULEMENT aux pages
for page_dir in src/app/pages/*/; do
    page_name=$(basename "$page_dir")
    if [ "$page_name" != "page-not-found" ]; then
        html_file="$page_dir${page_name}.component.html"
        ts_file="$page_dir${page_name}.component.ts"
        
        if [ -f "$html_file" ] && ! grep -q "<app-footer>" "$html_file"; then
            echo "<app-footer></app-footer>" >> "$html_file"
        fi
        
        if [ -f "$ts_file" ] && ! grep -q "FooterComponent" "$ts_file"; then
            sed -i.bak "/@Component/{i\\
import { FooterComponent } from '../../components/footer/footer.component';
}" "$ts_file"
            sed -i.bak 's/imports: \(\[[^]]*\)\]/imports: \1, FooterComponent]/' "$ts_file"
            rm -f "${ts_file}.bak"
        fi
    fi
done
find src/app/pages -name "*.bak" -delete

# 6. Tester
ng serve
