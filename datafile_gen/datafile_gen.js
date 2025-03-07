document.getElementById('datafileForm').addEventListener('submit', function (e) {
    e.preventDefault();

    const datafileURL = document.getElementById('datafileURL').value;
    fetch(datafileURL)
        .then(response => response.json())
        .then(data => {
            const csvContent = jsonToCsv(data);
            displayCsvAsTable(csvContent);
        })
        .catch(error => {
            console.error('Error fetching the datafile:', error);
            alert('Error fetching the Optimizely datafile.');
        });
});

function jsonToCsv(data) {
    let csv = 'accountId,anonymizeIP,botFiltering,projectId,revision,version,' +
              'experimentKey,experimentId,experimentLayerId,experimentStatus,' +
              'variationKey,variationId,trafficAllocationEntityId,trafficAllocationEndOfRange,' +
              'featureFlag,featureFlagId,featureFlagRolloutId,' +
              'variableId,variableKey,variableDefaultValue,' +
              'eventKey,eventId,' +
              'rolloutExperimentKey,rolloutExperimentId,rolloutTrafficAllocationEntityId,rolloutTrafficAllocationEndOfRange\n';

    const accountInfo = [
        data.accountId,
        data.anonymizeIP,
        data.botFiltering,
        data.projectId,
        data.revision,
        data.version
    ];

    // Loop through experiments
    data.experiments.forEach(experiment => {
        experiment.variations.forEach(variation => {
            experiment.trafficAllocation.forEach(traffic => {
                const trafficEndOfRange = (traffic.endOfRange / 100).toFixed(0);

                const experimentData = [
                    ...accountInfo,
                    experiment.key || '',
                    experiment.id || '',
                    experiment.layerId || '',
                    experiment.status || '',
                    variation.key || '',
                    variation.id || '',
                    traffic.entityId || '',
                    trafficEndOfRange || ''
                ];

                csv += formatRow(experimentData);
            });
        });
    });

    // Loop through featureFlags and add featureFlag key to the correct column
    data.featureFlags.forEach(featureFlag => {
        featureFlag.variables.forEach(variable => {
            const featureFlagData = [
                ...accountInfo,
                featureFlag.key || '',  // Ensure the key is listed under 'featureFlag' column
                featureFlag.id || '',
                featureFlag.rolloutId || '',
                variable.id || '',
                variable.key || '',
                variable.defaultValue || ''
            ];

            csv += formatRow(featureFlagData);
        });
    });

    // Loop through events
    data.events.forEach(event => {
        const eventData = [
            ...accountInfo,
            event.key || '',
            event.id || ''
        ];

        csv += formatRow(eventData);
    });

    // Loop through rollouts
    data.rollouts.forEach(rollout => {
        rollout.experiments.forEach(experiment => {
            experiment.trafficAllocation.forEach(traffic => {
                const trafficEndOfRange = (traffic.endOfRange / 100).toFixed(0);

                const rolloutData = [
                    ...accountInfo,
                    experiment.key || '',
                    experiment.id || '',
                    traffic.entityId || '',
                    trafficEndOfRange || ''
                ];

                csv += formatRow(rolloutData);
            });
        });
    });

    return csv;
}


// Helper function to format the row and ensure consistent columns
function formatRow(rowData) {
    const headerColumnCount = 24; // Number of columns in the header row
    while (rowData.length < headerColumnCount) {
        rowData.push('');  // Add empty values to match column count
    }
    return rowData.join(',') + '\n';
}


function displayCsvAsTable(csvContent) {
    const csvOutput = document.getElementById('csvOutput');
    const rows = csvContent.trim().split('\n');

    let tableHtml = '<table>';
    tableHtml += '<thead><tr>';

    // Create table header
    const headers = rows[0].split(',');
    headers.forEach(header => {
        tableHtml += `<th>${header}</th>`;
    });
    tableHtml += '</tr></thead><tbody>';

    // Create table rows
    rows.slice(1).forEach(row => {
        tableHtml += '<tr>';
        const columns = row.split(',');
        columns.forEach(column => {
            tableHtml += `<td>${column}</td>`;
        });
        tableHtml += '</tr>';
    });

    tableHtml += '</tbody></table>';

    csvOutput.innerHTML = tableHtml;
}
