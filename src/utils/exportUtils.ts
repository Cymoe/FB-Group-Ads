/**
 * Export utilities for groups data
 * Supports CSV, JSON, and Excel formats
 */

/**
 * Convert groups data to CSV format
 */
export function exportToCSV(groups: Record<string, any>[], filename: string = 'groups-export') {
  if (groups.length === 0) {
    alert('No data to export')
    return
  }

  // Get all unique keys from all groups
  const headers = Object.keys(groups[0])
  
  // Create CSV header row
  const csvHeaders = headers.join(',')
  
  // Create CSV data rows
  const csvRows = groups.map(group => {
    return headers.map(header => {
      const value = group[header]
      // Handle values that might contain commas, quotes, or newlines
      if (value === null || value === undefined) return ''
      const stringValue = String(value)
      // Escape quotes and wrap in quotes if contains comma, quote, or newline
      if (stringValue.includes(',') || stringValue.includes('"') || stringValue.includes('\n')) {
        return `"${stringValue.replace(/"/g, '""')}"`
      }
      return stringValue
    }).join(',')
  })
  
  // Combine headers and rows
  const csvContent = [csvHeaders, ...csvRows].join('\n')
  
  // Create BOM for UTF-8 (helps Excel open it correctly)
  const BOM = '\uFEFF'
  const blob = new Blob([BOM + csvContent], { type: 'text/csv;charset=utf-8;' })
  
  // Create download link
  const link = document.createElement('a')
  const url = URL.createObjectURL(blob)
  link.setAttribute('href', url)
  link.setAttribute('download', `${filename}-${new Date().toISOString().split('T')[0]}.csv`)
  link.style.visibility = 'hidden'
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}

/**
 * Convert groups data to JSON format
 */
export function exportToJSON(groups: Record<string, any>[], filename: string = 'groups-export') {
  if (groups.length === 0) {
    alert('No data to export')
    return
  }

  const jsonContent = JSON.stringify(groups, null, 2)
  const blob = new Blob([jsonContent], { type: 'application/json' })
  
  const link = document.createElement('a')
  const url = URL.createObjectURL(blob)
  link.setAttribute('href', url)
  link.setAttribute('download', `${filename}-${new Date().toISOString().split('T')[0]}.json`)
  link.style.visibility = 'hidden'
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}

/**
 * Convert groups data to Excel format (XLSX)
 * Uses a simple approach that creates a CSV with .xlsx extension
 * For full Excel support, you'd need a library like 'xlsx'
 */
export function exportToExcel(groups: Record<string, any>[], filename: string = 'groups-export') {
  // For now, we'll use CSV format but save as .xlsx
  // For full Excel support with formatting, install: npm install xlsx
  if (groups.length === 0) {
    alert('No data to export')
    return
  }

  // Get all unique keys
  const headers = Object.keys(groups[0])
  
  // Create CSV format (Excel can open CSV files)
  const csvHeaders = headers.join('\t') // Tab-separated for better Excel compatibility
  
  const csvRows = groups.map(group => {
    return headers.map(header => {
      const value = group[header]
      if (value === null || value === undefined) return ''
      return String(value).replace(/\t/g, ' ') // Replace tabs in values
    }).join('\t')
  })
  
  const content = [csvHeaders, ...csvRows].join('\n')
  const BOM = '\uFEFF'
  const blob = new Blob([BOM + content], { type: 'application/vnd.ms-excel' })
  
  const link = document.createElement('a')
  const url = URL.createObjectURL(blob)
  link.setAttribute('href', url)
  link.setAttribute('download', `${filename}-${new Date().toISOString().split('T')[0]}.xlsx`)
  link.style.visibility = 'hidden'
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}

/**
 * Format group data for export
 */
export function formatGroupForExport(group: any, companyName: string = '', postsCount: number = 0, healthStatus: string = '') {
  return {
    'Group Name': group.name || '',
    'Company': companyName || '',
    'Category': group.category || '',
    'Location': [group.target_city, group.target_state].filter(Boolean).join(', ') || '',
    'City': group.target_city || '',
    'State': group.target_state || '',
    'Privacy': group.privacy || '',
    'Quality Rating': group.quality_rating || '',
    'Members': group.audience_size || 0,
    'Posts': postsCount || 0,
    'Health Status': healthStatus || '',
    'Status': group.status || '',
    'Description': group.description || '',
    'QA Status': group.qa_status || '',
    'Last Post Date': group.last_post_date || '',
    'Created At': group.created_at || '',
    'Updated At': group.updated_at || ''
  }
}

