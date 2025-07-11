import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const formData = await req.formData()
    const file = formData.get('file')
    const productName = formData.get('productName')

    console.log('Received request with product name:', productName)

    if (!file || !productName) {
      console.error('Missing file or product name')
      return new Response(
        JSON.stringify({ error: 'Missing file or product name' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      )
    }

    // Create Supabase client
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // Convert file to base64
    const arrayBuffer = await file.arrayBuffer()
    const base64String = btoa(String.fromCharCode(...new Uint8Array(arrayBuffer)))

    console.log('Calling Google Vision API...')

    try {
      // Call OCR API (using Google Cloud Vision API)
      const visionResponse = await fetch('https://vision.googleapis.com/v1/images:annotate', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${Deno.env.get('GOOGLE_CLOUD_API_KEY')}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          requests: [{
            image: {
              content: base64String
            },
            features: [{ type: 'TEXT_DETECTION' }]
          }]
        })
      })

      if (!visionResponse.ok) {
        throw new Error(`Vision API responded with status: ${visionResponse.status}`)
      }

      const vision = await visionResponse.json()
      console.log('Vision API response received')

      if (!vision.responses?.[0]?.textAnnotations?.[0]?.description) {
        return new Response(
          JSON.stringify({ 
            matched: false,
            message: 'No text could be detected in the prescription image. Please ensure the image is clear and contains readable text.'
          }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      const extractedText = vision.responses[0].textAnnotations[0].description
      console.log('Extracted text:', extractedText)

      const medicineMatch = extractedText.toLowerCase().includes(productName.toString().toLowerCase())
      console.log('Medicine match result:', medicineMatch)

      // Store prescription in database
      const filePath = `prescriptions/${crypto.randomUUID()}`
      const { error: uploadError } = await supabase.storage
        .from('prescriptions')
        .upload(filePath, file)

      if (uploadError) {
        console.error('Upload error:', uploadError)
        throw uploadError
      }

      const { data: { publicUrl } } = supabase.storage
        .from('prescriptions')
        .getPublicUrl(filePath)

      // Get current user from auth header
      const authHeader = req.headers.get('Authorization')
      const userId = authHeader?.split('Bearer ')[1]

      if (!userId) {
        console.error('No user ID found in request')
        return new Response(
          JSON.stringify({ error: 'User not authenticated' }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 401 }
        )
      }

      // Save prescription record
      const { error: dbError } = await supabase
        .from('prescriptions')
        .insert({
          user_id: userId,
          file_url: publicUrl,
          medicine_name: productName,
          status: medicineMatch ? 'approved' : 'rejected'
        })

      if (dbError) {
        console.error('Database error:', dbError)
        throw dbError
      }

      return new Response(
        JSON.stringify({ 
          matched: medicineMatch,
          message: medicineMatch ? 
            'Prescription verified successfully' : 
            'The medicine name in the prescription does not match the selected medicine. Please verify and try again.'
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )

    } catch (visionError) {
      console.error('Vision API error:', visionError)
      return new Response(
        JSON.stringify({ 
          error: 'Failed to process prescription image',
          details: visionError.message 
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
      )
    }

  } catch (error) {
    console.error('Error in verify-prescription function:', error)
    return new Response(
      JSON.stringify({ 
        error: 'Failed to verify prescription',
        details: error.message 
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    )
  }
})