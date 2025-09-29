import { View, Text, TouchableOpacity, ScrollView, StatusBar, TextInput, Linking } from "react-native"
import { Phone, MapPin, Clock, Star, Search, Shield, Brain } from "lucide-react-native"
import { useRouter } from "expo-router"
import HeaderWithSidebar from "components/HeaderWithSidebar"
import { useState } from "react"

export default function TherapistsPage() {
  const router = useRouter()
  const [searchQuery, setSearchQuery] = useState("")

  const therapists = [
    {
      id: 1,
      name: "Dr. Sarah Johnson",
      specialty: "Clinical Psychology",
      rating: 4.8,
      reviews: 127,
      phone: "(555) 123-4567",
      address: "123 Wellness Ave, Downtown",
      hours: "Mon-Fri 9AM-6PM",
      description:
        "Specializes in anxiety, depression, and trauma therapy. Licensed clinical psychologist with 15 years of experience.",
      acceptsInsurance: true,
    },
    {
      id: 2,
      name: "Dr. Michael Chen",
      specialty: "Marriage & Family Therapy",
      rating: 4.9,
      reviews: 89,
      phone: "(555) 234-5678",
      address: "456 Harmony St, Midtown",
      hours: "Mon-Thu 10AM-8PM, Sat 9AM-3PM",
      description: "Expert in couples counseling and family dynamics. Certified marriage and family therapist.",
      acceptsInsurance: true,
    },
    {
      id: 3,
      name: "Dr. Emily Rodriguez",
      specialty: "Child & Adolescent Psychology",
      rating: 4.7,
      reviews: 156,
      phone: "(555) 345-6789",
      address: "789 Kids Care Blvd, Uptown",
      hours: "Tue-Sat 8AM-5PM",
      description:
        "Specialized in working with children and teenagers. Expert in behavioral issues and developmental psychology.",
      acceptsInsurance: false,
    },
    {
      id: 4,
      name: "Dr. James Wilson",
      specialty: "Addiction Counseling",
      rating: 4.6,
      reviews: 93,
      phone: "(555) 456-7890",
      address: "321 Recovery Way, Eastside",
      hours: "Mon-Fri 7AM-7PM",
      description: "Licensed addiction counselor with expertise in substance abuse recovery and support groups.",
      acceptsInsurance: true,
    },
  ]

  const filteredTherapists = therapists.filter(
    (therapist) =>
      therapist.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      therapist.specialty.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  const handleCall = (phoneNumber: string) => {
    Linking.openURL(`tel:${phoneNumber}`)
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
    <View className="flex-1 bg-gradient-to-br from-emerald-50 to-teal-50">
      <StatusBar barStyle="dark-content" backgroundColor="#ECFDF5" />

      <HeaderWithSidebar title="Mental Health Professionals" showBackButton={false} />

      {/* Search Section */}
      <View className="mx-4 mt-4">
        <View className="flex-row items-center rounded-2xl bg-white px-4 py-3 shadow-sm">
          <Search size={20} color="#6B7280" />
          <TextInput
            placeholder="Search by name or specialty"
            value={searchQuery}
            onChangeText={setSearchQuery}
            className="ml-3 flex-1 text-base text-gray-900"
            placeholderTextColor="#9CA3AF"
          />
        </View>
      </View>

      <ScrollView className="flex-1 px-4" showsVerticalScrollIndicator={false}>
        <View className="py-6">
          {/* Professional List */}
          <View className="space-y-6">
            {filteredTherapists.map((therapist) => (
              <View key={therapist.id} className="rounded-3xl bg-white shadow-lg">
                {/* Header */}
                <View className="p-6">
                  <View className="flex-row items-start justify-between">
                    <View className="flex-1">
                      <Text className="text-xl font-bold text-gray-900">{therapist.name}</Text>
                      <Text className="mt-1 text-base text-emerald-600 font-semibold">{therapist.specialty}</Text>
                    </View>
                    <View className="ml-4">
                      <View
                        className={`rounded-full px-4 py-2 ${
                          therapist.acceptsInsurance ? "bg-emerald-100" : "bg-amber-100"
                        }`}
                      >
                        <Text
                          className={`text-xs font-bold ${
                            therapist.acceptsInsurance ? "text-emerald-700" : "text-amber-700"
                          }`}
                        >
                          {therapist.acceptsInsurance ? "Insurance" : "Private Pay"}
                        </Text>
                      </View>
                    </View>
                  </View>

                  {/* Rating */}
                  <View className="mt-3 flex-row items-center">
                    <View className="mr-2 flex-row">{renderRating(therapist.rating)}</View>
                    <Text className="text-sm font-semibold text-gray-700">{therapist.rating}</Text>
                    <Text className="ml-1 text-sm text-gray-500">({therapist.reviews} reviews)</Text>
                  </View>
                </View>

                {/* Content */}
                <View className="px-6 pb-6">
                  {/* Description */}
                  <Text className="mb-6 text-gray-700 leading-relaxed">{therapist.description}</Text>

                  {/* Insurance Status */}
                  <View className="mb-6 rounded-2xl bg-gray-100 p-4">
                    <Text className="text-sm font-semibold text-gray-900">Payment Options</Text>
                    <Text className="text-base font-bold text-gray-700">
                      {therapist.acceptsInsurance ? "Insurance Accepted" : "Private Pay Only"}
                    </Text>
                  </View>

                  {/* Contact Information */}
                  <View style={{gap: 12}}>
                    <View className="flex-row items-center">
                      <View className="rounded-full bg-gray-100 p-2">
                        <Phone size={16} color="#6B7280" />
                      </View>
                      <Text className="ml-3 text-gray-700">{therapist.phone}</Text>
                    </View>
                    <View className="flex-row items-center">
                      <View className="rounded-full bg-gray-100 p-2">
                        <MapPin size={16} color="#6B7280" />
                      </View>
                      <Text className="ml-3 text-gray-700">{therapist.address}</Text>
                    </View>
                    <View className="flex-row items-center">
                      <View className="rounded-full bg-gray-100 p-2">
                        <Clock size={16} color="#6B7280" />
                      </View>
                      <Text className="ml-3 text-gray-700">{therapist.hours}</Text>
                    </View>
                  </View>
                </View>

                {/* Actions */}
                <View className="border-t border-gray-100 p-6">
                  <View className="flex-row" style={{gap: 12}}>
                    <TouchableOpacity
                      className="flex-1 rounded-2xl bg-gray-900 px-4 py-4 shadow-sm"
                      onPress={() => handleCall(therapist.phone)}
                    >
                      <View className="flex-row items-center justify-center">
                        <Phone size={18} color="#FFFFFF" />
                        <Text className="ml-2 text-base font-semibold text-white">Call Practice</Text>
                      </View>
                    </TouchableOpacity>
                    <TouchableOpacity
                      className="flex-1 rounded-2xl border border-gray-300 bg-white px-4 py-4 shadow-sm"
                      onPress={() => handleGetDirections(therapist.address)}
                    >
                      <View className="flex-row items-center justify-center">
                        <MapPin size={18} color="#6B7280" />
                        <Text className="ml-2 text-base font-semibold text-gray-700">Directions</Text>
                      </View>
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            ))}
          </View>

          {/* Crisis Resources */}
          <View className="mt-8 rounded-3xl bg-red-50 border border-red-200 shadow-lg">
            <View className="p-6">
              <View className="flex-row items-center mb-4">
                <View className="rounded-full bg-red-100 p-3">
                  <Shield size={24} color="#DC2626" />
                </View>
                <View className="ml-4">
                  <Text className="text-xl font-bold text-red-900">Crisis Support Resources</Text>
                  <Text className="text-sm text-red-700">Immediate help is available 24/7</Text>
                </View>
              </View>
              <Text className="mb-6 text-sm text-red-800 leading-relaxed">
                If you are experiencing a mental health emergency, immediate help is available:
              </Text>
              <TouchableOpacity
                className="rounded-2xl bg-red-600 px-6 py-4 shadow-lg"
                onPress={() => handleCall("988")}
              >
                <View className="flex-row items-center justify-center">
                  <Phone size={18} color="#FFFFFF" />
                  <Text className="ml-2 text-lg font-bold text-white">Crisis Lifeline: 988</Text>
                </View>
              </TouchableOpacity>
            </View>
          </View>

          {/* Mental Health Tips */}
          <View className="mt-6 rounded-3xl bg-white shadow-lg">
            <View className="border-b border-gray-100 p-6">
              <Text className="text-xl font-bold text-gray-900">Mental Health Tips</Text>
            </View>
            <View className="p-6">
              <View style={{gap: 16}}>
                  <View className="rounded-2xl bg-emerald-50 border border-emerald-200 p-4">
                  <Text className="text-base font-semibold text-gray-900 mb-2">Practice Self-Care</Text>
                  <Text className="text-sm text-gray-600">
                    Regular exercise, healthy eating, and adequate sleep are fundamental to mental wellness.
                  </Text>
                </View>
                  <View className="rounded-2xl bg-blue-50 border border-blue-200 p-4">
                  <Text className="text-base font-semibold text-gray-900 mb-2">Stay Connected</Text>
                  <Text className="text-sm text-gray-600">
                    Maintain relationships with family and friends. Social support is crucial for mental health.
                  </Text>
                </View>
                  <View className="rounded-2xl bg-purple-50 border border-purple-200 p-4">
                  <Text className="text-base font-semibold text-gray-900 mb-2">Seek Help Early</Text>
                  <Text className="text-sm text-gray-600">
                    Don't wait until you're in crisis. Early intervention leads to better outcomes.
                  </Text>
                </View>
              </View>
            </View>
          </View>
        </View>
      </ScrollView>
    </View>
  )
}
