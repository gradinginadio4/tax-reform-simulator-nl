(function() {
    'use strict';

    const state = {
        currentStep: 1,
        totalSteps: 5,
        data: {
            clientMix: { sme: 0, corporate: 0, international: 0 },
            specialization: [],
            digitalMaturity: {
                portal: null,
                eInvoicing: false,
                timeTracking: false,
                automation: false
            },
            geographicScope: null
        }
    };

    const elements = {
        form: document.getElementById('simulationForm'),
        steps: document.querySelectorAll('.form-step'),
        progressSteps: document.querySelectorAll('.progress-step'),
        progressLines: document.querySelectorAll('.progress-line'),
        
        smeInput: document.getElementById('smeClients'),
        corporateInput: document.getElementById('corporateClients'),
        internationalInput: document.getElementById('internationalClients'),
        smeDisplay: document.getElementById('smeDisplay'),
        corporateDisplay: document.getElementById('corporateDisplay'),
        internationalDisplay: document.getElementById('internationalDisplay'),
        clientMixValidation: document.getElementById('clientMixValidation'),
        toStep2: document.getElementById('toStep2'),
        
        backToStep1: document.getElementById('backToStep1'),
        toStep3: document.getElementById('toStep3'),
        backToStep2: document.getElementById('backToStep2'),
        toStep4: document.getElementById('toStep4'),
        backToStep3: document.getElementById('backToStep3'),
        calculateResults: document.getElementById('calculateResults'),
        restartSimulation: document.getElementById('restartSimulation')
    };

    const formatPercentage = (value) => `${value}%`;
    
    const validateClientMix = () => {
        const sme = parseInt(elements.smeInput.value) || 0;
        const corporate = parseInt(elements.corporateInput.value) || 0;
        const international = parseInt(elements.internationalInput.value) || 0;
        const total = sme + corporate + international;
        
        state.data.clientMix = { sme, corporate, international };
        
        if (total === 100) {
            elements.clientMixValidation.classList.remove('visible');
            elements.toStep2.disabled = false;
            return true;
        } else {
            elements.clientMixValidation.classList.add('visible');
            elements.toStep2.disabled = true;
            return false;
        }
    };

    const updateProgress = (step) => {
        elements.progressSteps.forEach((el, index) => {
            const stepNum = index + 1;
            el.classList.remove('active', 'completed');
            if (stepNum === step) {
                el.classList.add('active');
            } else if (stepNum < step) {
                el.classList.add('completed');
            }
        });

        elements.progressLines.forEach((el, index) => {
            el.classList.remove('completed');
            if (index < step - 1) {
                el.classList.add('completed');
            }
        });
    };

    const showStep = (step) => {
        elements.steps.forEach((el, index) => {
            el.classList.remove('active');
            if (index === step - 1) {
                el.classList.add('active');
            }
        });
        state.currentStep = step;
        updateProgress(step);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const collectSpecializations = () => {
        const checkboxes = document.querySelectorAll('input[name="specialization"]:checked');
        state.data.specialization = Array.from(checkboxes).map(cb => cb.value);
    };

    const collectDigitalMaturity = () => {
        const portalValue = document.querySelector('input[name="clientPortal"]:checked');
        state.data.digitalMaturity.portal = portalValue ? portalValue.value === 'true' : null;
        
        state.data.digitalMaturity.eInvoicing = document.getElementById('eInvoicingCapable').checked;
        state.data.digitalMaturity.timeTracking = document.getElementById('timeTrackingSoftware').checked;
        state.data.digitalMaturity.automation = document.getElementById('automationTools').checked;
    };

    const collectGeographicScope = () => {
        const scope = document.querySelector('input[name="geographicScope"]:checked');
        state.data.geographicScope = scope ? scope.value : null;
    };

    const calculateDisruptionScore = () => {
        let score = 0;
        const data = state.data;

        if (data.specialization.includes('capitalGains')) {
            score += data.clientMix.corporate > 30 ? 20 : 15;
        }

        if (data.specialization.includes('exitTax')) {
            score += data.clientMix.international > 20 ? 18 : 12;
        }

        if (data.specialization.includes('digitalInvoicing') || data.clientMix.sme > 40) {
            const digitalGap = !data.digitalMaturity.eInvoicing ? 15 : 5;
            score += digitalGap;
        }

        if (data.specialization.includes('crossBorder') || data.geographicScope !== 'belgiumOnly') {
            score += data.geographicScope === 'globalScope' ? 12 : 8;
        }

        if (!data.digitalMaturity.portal) score += 8;
        if (!data.digitalMaturity.timeTracking) score += 10;
        if (!data.digitalMaturity.automation) score += 5;

        if (data.clientMix.international > 30) score += 7;
        if (data.clientMix.corporate > 50) score += 5;

        return Math.min(Math.round(score), 100);
    };

    const getRiskBreakdown = (score) => {
        const risks = [];
        const data = state.data;

        if (data.specialization.includes('capitalGains')) {
            risks.push({
                level: 'high',
                text: 'Meerwaardenhervorming (01/01/2026): Nieuwe belastingsregels voor bedrijfsmeerwaarden'
            });
        }

        if (data.specialization.includes('exitTax')) {
            risks.push({
                level: 'high',
                text: 'Exit tax (07/2025): Nieuwe aangifte- en betalingsverplichtingen bij verplaatsing maatschappelijke zetel'
            });
        }

        if (!data.digitalMaturity.eInvoicing) {
            risks.push({
                level: 'high',
                text: 'B2B elektronische facturatieplicht: Niet-conformiteit met uitvoeringsbesluiten wet 15 januari 2018'
            });
        }

        if (!data.digitalMaturity.timeTracking) {
            risks.push({
                level: 'high',
                text: 'Tijdregistratiesoftware (KB 12/05/2023): Wettelijke verplichting niet nageleefd voor BTW-plichtige ondernemingen'
            });
        }

        if (data.geographicScope !== 'belgiumOnly') {
            risks.push({
                level: 'medium',
                text: 'DAC7: Nieuwe aangifteverplichtingen voor digitale platformen en operatoren'
            });
        }

        if (data.clientMix.international > 30) {
            risks.push({
                level: 'medium',
                text: 'Grensoverschrijdende complexiteit: Toename automatische uitwisseling van fiscale gegevens'
            });
        }

        return risks;
    };

    const getAutomationOpportunities = () => {
        const opportunities = [];
        const data = state.data;

        if (!data.digitalMaturity.eInvoicing) {
            opportunities.push({
                priority: 1,
                text: 'Peppol-integratie: Verplichte aansluiting op federaal elektronisch facturatieplatform'
            });
        }

        if (!data.digitalMaturity.timeTracking) {
            opportunities.push({
                priority: 2,
                text: 'Implementatie tijdregistratiesoftware: Onmiddellijke conformiteit vereist (strafrechtelijke sancties bij controle)'
            });
        }

        if (!data.digitalMaturity.portal) {
            opportunities.push({
                priority: 3,
                text: 'Beveiligd klantenportaal: GDPR-risicoreductie en klantrelatie-optimalisatie'
            });
        }

        opportunities.push({
            priority: 4,
            text: 'Automatisering hervormingsmeldingen: Alertsysteem voor cliënten over reglementaire wijzigingen'
        });

        if (data.specialization.includes('crossBorder') || data.geographicScope !== 'belgiumOnly') {
            opportunities.push({
                priority: 5,
                text: 'DAC7-conformiteitsworkflows: Automatisering van aangiftes en consistentiecontroles'
            });
        }

        return opportunities;
    };

    const getComplianceBlueprint = () => {
        return [
            { phase: 'Onmiddellijk (0-30 dagen)', action: 'Conformiteitsaudit tijdregistratie- en facturatiesoftware' },
            { phase: 'Korte termijn (1-3 maanden)', action: 'Conformiteit KB 12/05/2023 en Peppol-aansluiting indien van toepassing' },
            { phase: 'Middellange termijn (3-6 maanden)', action: 'Voorbereiding meerwaardenhervorming 2026 en teamtraining' },
            { phase: 'Doorlopend', action: 'Gestructureerde reglementaire monitoring en documentatie van wetswijzigingen' }
        ];
    };

    const getPeerPositioning = (score) => {
        const peers = [
            { name: 'Big 4 en internationale netwerken', readiness: score < 30 ? 'Hoog' : 'Zeer hoog' },
            { name: 'Middelgrote regionale kantoren (10-50 pers.)', readiness: score < 50 ? 'Gemiddeld' : 'Te versterken' },
            { name: 'Kleine zelfstandige kantoren', readiness: score > 60 ? 'Laag' : 'Gemiddeld' }
        ];
        return peers;
    };

    const displayResults = () => {
        const score = calculateDisruptionScore();
        const scoreCircle = document.getElementById('disruptionScore');
        const scoreValue = scoreCircle.querySelector('.score-value');
        const interpretation = document.getElementById('scoreInterpretation');
        
        scoreCircle.style.setProperty('--score', score);
        let currentScore = 0;
        const increment = score > 0 ? Math.ceil(score / 20) : 0;
        const timer = setInterval(() => {
            currentScore += increment;
            if (currentScore >= score) {
                currentScore = score;
                clearInterval(timer);
            }
            scoreValue.textContent = currentScore;
        }, 50);

        let interpText = '';
        if (score >= 70) {
            interpText = 'Hoge reglementaire blootstelling. Structurele interventie dringend vereist.';
            interpretation.style.color = 'var(--danger)';
        } else if (score >= 40) {
            interpText = 'Matige blootstelling. Prioriteitenactieplan aanbevolen binnen 90 dagen.';
            interpretation.style.color = 'var(--warning)';
        } else {
            interpText = 'Beheerste blootstelling. Monitoring en continue optimalisatie.';
            interpretation.style.color = 'var(--success)';
        }
        interpretation.textContent = interpText;

        const riskContainer = document.getElementById('riskBreakdown');
        const risks = getRiskBreakdown(score);
        riskContainer.innerHTML = risks.map(risk => `
            <div class="risk-item">
                <span class="risk-indicator risk-${risk.level}"></span>
                <span>${risk.text}</span>
            </div>
        `).join('');

        const autoContainer = document.getElementById('automationMatrix');
        const opportunities = getAutomationOpportunities();
        autoContainer.innerHTML = opportunities.map(opp => `
            <div class="opportunity-item">
                <span class="opportunity-indicator">${opp.priority}</span>
                <span>${opp.text}</span>
            </div>
        `).join('');

        const heatmapContainer = document.getElementById('peerHeatmap');
        const peers = getPeerPositioning(score);
        heatmapContainer.innerHTML = peers.map(peer => `
            <div class="heatmap-item ${score > 50 ? 'active' : ''}">
                <div class="heatmap-label">${peer.name}</div>
                <div class="heatmap-value">${peer.readiness}</div>
            </div>
        `).join('');

        const blueprintContainer = document.getElementById('complianceBlueprint');
        const blueprint = getComplianceBlueprint();
        blueprintContainer.innerHTML = blueprint.map(item => `
            <div class="blueprint-item">
                <strong>${item.phase}:</strong> ${item.action}
            </div>
        `).join('');
    };

    const init = () => {
        [elements.smeInput, elements.corporateInput, elements.internationalInput].forEach(input => {
            input.addEventListener('input', (e) => {
                const display = document.getElementById(e.target.id.replace('Clients', 'Display'));
                display.textContent = formatPercentage(e.target.value);
                validateClientMix();
            });
        });

        elements.toStep2.addEventListener('click', () => {
            if (validateClientMix()) showStep(2);
        });

        elements.backToStep1.addEventListener('click', () => showStep(1));

        elements.toStep3.addEventListener('click', () => {
            collectSpecializations();
            showStep(3);
        });

        elements.backToStep2.addEventListener('click', () => showStep(2));

        elements.toStep4.addEventListener('click', () => {
            collectDigitalMaturity();
            showStep(4);
        });

        elements.backToStep3.addEventListener('click', () => showStep(3));

        elements.calculateResults.addEventListener('click', () => {
            collectGeographicScope();
            showStep(5);
            setTimeout(displayResults, 300);
        });

        elements.restartSimulation.addEventListener('click', () => {
            elements.form.reset();
            state.data = {
                clientMix: { sme: 0, corporate: 0, international: 0 },
                specialization: [],
                digitalMaturity: {
                    portal: null,
                    eInvoicing: false,
                    timeTracking: false,
                    automation: false
                },
                geographicScope: null
            };
            ['smeDisplay', 'corporateDisplay', 'internationalDisplay'].forEach(id => {
                document.getElementById(id).textContent = '0%';
            });
            elements.toStep2.disabled = true;
            showStep(1);
        });

        validateClientMix();
    };

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
