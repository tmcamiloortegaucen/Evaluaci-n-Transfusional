function evaluateTransfusion() {
    // 1. Get Data
    const age = parseFloat(document.getElementById('age').value);
    const ageUnit = document.getElementById('ageUnit').value;
    const diagnosis = document.getElementById('diagnosis').value;

    // Checkboxes
    const isCancer = document.getElementById('cancer').checked;
    const isImmuno = document.getElementById('immunosuppressed').checked;
    const isNeonateInput = document.getElementById('neonate').checked;
    const hasAnaphylaxis = document.getElementById('anaphylaxis').checked;
    const isCardioRenal = document.getElementById('cardioRenal').checked; // New input

    // Normalize Age to Years for internal logic if needed, 
    // but simplified boolean 'isNeonate' is often enough or derive from age.
    // Let's rely on the explicit check for 'isNeonate' from input as prompt requested, 
    // but also trust explicit neonatal unit context if selected.
    const isNeonatalService = diagnosis === 'neonatologia';
    // Logic: Treat as neonate if checkbox checked OR service is neonatology OR age is notably low (e.g. < 4 months)
    let isNeonate = isNeonateInput || isNeonatalService;

    if (ageUnit === 'days' && age < 120) isNeonate = true;
    if (ageUnit === 'months' && age < 4) isNeonate = true;

    // 2. Logic Engine
    const recommendations = [];
    const justificationParts = [];

    // Base: All RBCs in this modern context are usually Leukoreduced
    recommendations.push("Filtrado (Leucorreducido)");
    justificationParts.push("Filtración Universal: Estándar de calidad recomendado para todos los pacientes.");

    // Rule: Irradiated
    // Cancer(Hemato), Immuno, Neonate
    const riskTAGv = isImmuno || (isCancer && (diagnosis === 'hemato-onco' || diagnosis === 'otro')) || isNeonate || diagnosis === 'hemato-onco';

    if (riskTAGv) {
        recommendations.push("Irradiado");
        justificationParts.push("Para prevenir la Enfermedad Injerto contra Huésped (EICH) en pacientes inmunocomprometidos o neonatos.");
    }

    // Rule: Washed
    if (hasAnaphylaxis) {
        recommendations.push("Lavado");
        justificationParts.push("Para remover proteínas plasmáticas y prevenir nuevas reacciones anafilácticas graves.");
    }

    // Rule: CMV Safe
    // Neonate, Immuno
    if (isNeonate || isImmuno) {
        recommendations.push("CMV-Safe");
        // Often implicit in leukoreduction, but explicit request
        if (!justificationParts.some(t => t.includes("CMV"))) {
            justificationParts.push("Para reducir riesgo de infección por citomegalovirus (CMV).");
        }
    }

    // Rule: Fresh (<7-10d)
    // Neonate, Cardio/Renal
    if (isNeonate || isCardioRenal) {
        recommendations.push("Fresco (<7-10 días)");
        justificationParts.push("Para minimizar la carga de potasio y asegurar máxima funcionalidad en pacientes vulnerables hemódinámica o metabólicamente.");
    }

    // 3. Render
    const resultContainer = document.getElementById('resultContainer');
    const criteriaList = document.getElementById('criteriaList');
    const justificationText = document.getElementById('justificationText');
    const productBadge = document.getElementById('productBadge');

    // Clear previous
    criteriaList.innerHTML = '';

    // Construct Product Name
    let productName = "CGR Estándar";
    if (recommendations.length > 1) { // More than just Leucorreducido
        productName = "CGR Modificado";
    }
    productBadge.textContent = productName;

    // Tags
    recommendations.forEach(rec => {
        const tag = document.createElement('span');
        tag.className = 'tag';
        tag.textContent = rec;
        if (rec === 'Lavado' || rec === 'Irradiado') tag.classList.add('warning-tag');
        criteriaList.appendChild(tag);
    });

    // Justification
    // Combine unique sentences
    const uniqueJustifications = [...new Set(justificationParts)];
    justificationText.textContent = uniqueJustifications.join(" ");

    // Show
    resultContainer.classList.remove('hidden');
    resultContainer.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}
