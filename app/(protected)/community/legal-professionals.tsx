import { View, Text, TouchableOpacity, ScrollView, StatusBar, TextInput, Linking } from "react-native"
import { Scale, Phone, MapPin, Clock, Star, Search, Mail } from "lucide-react-native"
import { useRouter } from "expo-router"
import HeaderWithSidebar from "components/HeaderWithSidebar"
import { useState } from "react"

export default function LegalProfessionalsPage() {
  const router = useRouter()
  const [searchQuery, setSearchQuery] = useState("")

  const legalProfessionals = [
    {
      id: 1,
      name: "Sarah Mitchell, Esq.",
      specialty: "Criminal Defense",
      firm: "Mitchell & Associates",
      rating: 4.8,
      reviews: 94,
      phone: "(555) 123-4567",
      email: "sarah@mitchelllaw.com",
      address: "123 Justice Ave, Downtown",
      hours: "Mon-Fri 8AM-6PM",
      experience: "15 years",
      description:
        "Experienced criminal defense attorney specializing in DUI, domestic violence, and white-collar crimes.",
      consultationFee: "Free consultation",
      languages: ["English", "Spanish"],
    },
    {
      id: 2,
      name: "David Rodriguez, Esq.",
      specialty: "Personal Injury",
      firm: "Rodriguez Legal Group",
      rating: 4.9,
      reviews: 156,
      phone: "(555) 234-5678",
      email: "david@rodriguezlegal.com",
      address: "456 Injury Law Blvd, Midtown",
      hours: "Mon-Fri 9AM-7PM, Sat 10AM-2PM",
      experience: "20 years",
      description:
        "Personal injury specialist with expertise in car accidents, slip and fall, and medical malpractice cases.",
      consultationFee: "No fee unless we win",
      languages: ["English", "Spanish"],
    },
    {
      id: 3,
      name: "Emily Chen, Esq.",
      specialty: "Family Law",
      firm: "Chen Family Law",
      rating: 4.7,
      reviews: 128,
      phone: "(555) 345-6789",
      email: "emily@chenfamilylaw.com",
      address: "789 Family Court Way, Westside",
      hours: "Mon-Thu 8AM-6PM, Fri 8AM-4PM",
      experience: "12 years",
      description: "Compassionate family law attorney handling divorce, child custody, and domestic violence cases.",
      consultationFee: "$200 consultation",
      languages: ["English", "Mandarin"],
    },
    {
      id: 4,
      name: "Michael Thompson, Esq.",
      specialty: "Immigration Law",
      firm: "Thompson Immigration Services",
      rating: 4.6,
      reviews: 203,
      phone: "(555) 456-7890",
      email: "michael@thompsonimmigration.com",
      address: "321 Immigration Plaza, Eastside",
      hours: "Mon-Fri 8AM-6PM",
      experience: "18 years",
      description: "Immigration attorney specializing in visa applications, green cards, and deportation defense.",
      consultationFee: "$150 consultation",
      languages: ["English", "Spanish", "Portuguese"],
    },
    {
      id: 5,
      name: "Lisa Johnson, Esq.",
      specialty: "Employment Law",
      firm: "Johnson Employment Law",
      rating: 4.5,
      reviews: 87,
      phone: "(555) 567-8901",
      email: "lisa@johnsonemployment.com",
      address: "654 Worker Rights St, Northside",
      hours: "Mon-Fri 9AM-5PM",
      experience: "10 years",
      description:
        "Employment law attorney fighting for workers' rights in discrimination, harassment, and wrongful termination cases.",
      consultationFee: "Free consultation",
      languages: ["English"],
    },
    {
      id: 6,
      name: "Robert Davis, Esq.",
      specialty: "Public Defender",
      firm: "Public Defender's Office",
      rating: 4.4,
      reviews: 76,
      phone: "(555) 678-9012",
      email: "robert.davis@publicdefender.gov",
      address: "987 Court House Square, Downtown",
      hours: "Mon-Fri 8AM-5PM",
      experience: "8 years",
      description: "Public defender providing free legal representation for those who cannot afford private counsel.",
      consultationFee: "Free (income qualified)",
      languages: ["English", "Spanish"],
    },
  ]

  const legalResources = [
    {
      name: "Legal Aid Society",
      phone: "(555) 100-2000",
      description: "Free legal services for low-income individuals",
    },
    {
      name: "Bar Association Referral",
      phone: "(555) 100-3000",
      description: "24/7 attorney referral service",
    },
    {
      name: "Victim Rights Advocate",
      phone: "(555) 100-4000",
      description: "Support and advocacy for crime victims",
    },
  ]

  const filteredProfessionals = legalProfessionals.filter(
    (professional) =>
      professional.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      professional.specialty.toLowerCase().includes(searchQuery.toLowerCase()) ||
      professional.firm.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  const handleCall = (phoneNumber: string) => {
    Linking.openURL(`tel:${phoneNumber}`)
  }

  const handleEmail = (email: string) => {
    Linking.openURL(`mailto:${email}`)
  }

  const handleGetDirections = (address: string) => {
    const encodedAddress = encodeURIComponent(address)
    Linking.openURL(`maps:0,0?q=${encodedAddress}`)
  }

  const renderRating = (rating: number) => {
    const stars = []
    const fullStars = Math.floor(rating)
    const hasHalfStar = rating % 1 !== 0

    for (let i = 0; i < fullStars; i++) {
      stars.push(<Star key={i} size={14} color="#F59E0B" fill="#F59E0B" />)
    }
    if (hasHalfStar) {
      stars.push(<Star key="half" size={14} color="#F59E0B" fill="#F59E0B" />)
    }
    const emptyStars = 5 - Math.ceil(rating)
    for (let i = 0; i < emptyStars; i++) {
      stars.push(<Star key={`empty-${i}`} size={14} color="#E5E7EB" />)
    }

    return stars
  }

  return (
    <View className="flex-1 bg-gradient-to-br from-amber-50 to-orange-50">
      <StatusBar barStyle="dark-content" backgroundColor="#FFFBEB" />

      <HeaderWithSidebar title="Legal Services" showBackButton={false} />

      {/* Search Section */}
      <View className="mx-4 mt-4">
        <View className="flex-row items-center rounded-2xl bg-white px-4 py-3 shadow-sm">
          <Search size={20} color="#6B7280" />
          <TextInput
            placeholder="Search attorneys or legal specialties"
            value={searchQuery}
            onChangeText={setSearchQuery}
            className="ml-3 flex-1 text-base text-gray-900"
            placeholderTextColor="#9CA3AF"
          />
        </View>
      </View>

      <ScrollView className="flex-1 px-4" showsVerticalScrollIndicator={false}>
        <View className="py-6">
          {/* Legal Professionals List */}
          <View className="space-y-6">
            {filteredProfessionals.map((professional) => (
              <View key={professional.id} className="rounded-3xl bg-white shadow-lg">
                {/* Header */}
                <View className="p-6">
                  <View className="flex-row items-start justify-between">
                    <View className="flex-1">
                      <Text className="text-xl font-bold text-gray-900">{professional.name}</Text>
                      <Text className="mt-1 text-base text-amber-600 font-semibold">{professional.specialty}</Text>
                      <Text className="text-sm text-gray-500">{professional.firm}</Text>
                    </View>
                    <View className="ml-4 flex-row" style={{gap: 8}}>
                      <View className="rounded-full bg-amber-100 px-3 py-1">
                        <Text className="text-xs font-medium text-amber-700">{professional.experience}</Text>
                      </View>
                      <View
                        className={`rounded-full px-3 py-1 ${
                          professional.consultationFee.includes("Free") ? "bg-emerald-100" : "bg-blue-100"
                        }`}
                      >
                        <Text
                          className={`text-xs font-bold ${
                            professional.consultationFee.includes("Free") ? "text-emerald-700" : "text-blue-700"
                          }`}
                        >
                          {professional.consultationFee.includes("Free") ? "Free" : "Paid"}
                        </Text>
                      </View>
                    </View>
                  </View>

                  {/* Rating */}
                  <View className="mt-3 flex-row items-center">
                    <View className="mr-2 flex-row">{renderRating(professional.rating)}</View>
                    <Text className="text-sm font-semibold text-gray-700">{professional.rating}</Text>
                    <Text className="ml-1 text-sm text-gray-500">({professional.reviews} reviews)</Text>
                  </View>
                </View>

                {/* Content */}
                <View className="px-6 pb-6">
                  {/* Description */}
                  <Text className="mb-6 text-gray-700 leading-relaxed">{professional.description}</Text>

                  {/* Languages */}
                  <View className="mb-6">
                    <Text className="mb-3 text-base font-semibold text-gray-900">Languages</Text>
                    <View className="flex-row flex-wrap gap-2">
                      {professional.languages.map((language, index) => (
                        <View
                          key={index}
                          className="rounded-full bg-amber-50 border border-amber-200 px-4 py-2"
                        >
                          <Text className="text-sm font-medium text-amber-700">{language}</Text>
                        </View>
                      ))}
                    </View>
                  </View>

                  {/* Consultation Fee */}
                  <View className="mb-6 rounded-2xl bg-gray-100 p-4">
                    <Text className="text-sm font-semibold text-gray-900">Consultation Fee</Text>
                    <Text className="text-base font-bold text-gray-700">{professional.consultationFee}</Text>
                  </View>

                  {/* Contact Information */}
                  <View style={{gap: 12}}>
                    <View className="flex-row items-center">
                      <View className="rounded-full bg-gray-100 p-2">
                        <Phone size={16} color="#6B7280" />
                      </View>
                      <Text className="ml-3 text-gray-700">{professional.phone}</Text>
                    </View>
                    <View className="flex-row items-center">
                      <View className="rounded-full bg-gray-100 p-2">
                        <Mail size={16} color="#6B7280" />
                      </View>
                      <Text className="ml-3 text-gray-700">{professional.email}</Text>
                    </View>
                    <View className="flex-row items-center">
                      <View className="rounded-full bg-gray-100 p-2">
                        <MapPin size={16} color="#6B7280" />
                      </View>
                      <Text className="ml-3 text-gray-700">{professional.address}</Text>
                    </View>
                    <View className="flex-row items-center">
                      <View className="rounded-full bg-gray-100 p-2">
                        <Clock size={16} color="#6B7280" />
                      </View>
                      <Text className="ml-3 text-gray-700">{professional.hours}</Text>
                    </View>
                  </View>
                </View>

                {/* Actions */}
                <View className="border-t border-gray-100 p-6">
                  <View style={{gap: 16}}>
                    <View className="flex-row" style={{gap: 12}}>
                      <TouchableOpacity
                        className="flex-1 rounded-2xl bg-gray-900 px-4 py-3 shadow-sm"
                        onPress={() => handleCall(professional.phone)}
                      >
                        <View className="flex-row items-center justify-center">
                          <Phone size={16} color="#FFFFFF" />
                          <Text className="ml-2 text-sm font-semibold text-white">Call Office</Text>
                        </View>
                      </TouchableOpacity>
                      <TouchableOpacity
                        className="flex-1 rounded-2xl border border-gray-300 bg-white px-4 py-3 shadow-sm"
                        onPress={() => handleEmail(professional.email)}
                      >
                        <View className="flex-row items-center justify-center">
                          <Mail size={16} color="#6B7280" />
                          <Text className="ml-2 text-sm font-semibold text-gray-700">Email</Text>
                        </View>
                      </TouchableOpacity>
                    </View>
                    <TouchableOpacity
                      className="rounded-2xl border border-gray-300 bg-white px-4 py-3 shadow-sm"
                      onPress={() => handleGetDirections(professional.address)}
                    >
                      <View className="flex-row items-center justify-center">
                        <MapPin size={16} color="#6B7280" />
                        <Text className="ml-2 text-sm font-semibold text-gray-700">Get Directions</Text>
                      </View>
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            ))}
          </View>

          {/* Additional Legal Resources */}
          <View className="mt-8 rounded-3xl bg-white shadow-lg">
            <View className="border-b border-gray-100 p-6">
              <Text className="text-xl font-bold text-gray-900">Additional Legal Resources</Text>
            </View>
            <View className="p-6">
              <View style={{gap: 16}}>
                {legalResources.map((resource, index) => (
                  <TouchableOpacity
                    key={index}
                    className="rounded-2xl bg-amber-50 border border-amber-200 p-4"
                    onPress={() => handleCall(resource.phone)}
                  >
                    <View>
                      <Text className="text-base font-bold text-gray-900">{resource.name}</Text>
                      <View className="flex-row items-start justify-between">
                        <Text className="text-sm text-gray-600 flex-1 pr-4">{resource.description}</Text>
                        <Text className="text-sm font-bold text-amber-700">{resource.phone}</Text>
                      </View>
                    </View>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          </View>

          {/* Legal Disclaimer */}
          <View className="mt-6 rounded-3xl bg-gray-100 p-6">
            <Text className="mb-2 text-lg font-bold text-gray-900">Legal Disclaimer</Text>
            <Text className="text-sm text-gray-600 leading-relaxed">
              The information provided is for general informational purposes only and does not constitute legal advice.
              Please consult with a qualified attorney for advice regarding your specific legal situation.
            </Text>
          </View>
        </View>
      </ScrollView>
    </View>
  )
}
