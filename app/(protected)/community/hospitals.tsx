import { View, Text, TouchableOpacity, ScrollView, StatusBar, TextInput, Linking } from "react-native"
import { Phone, MapPin, Clock, Star, Search, Ambulance, AlertTriangle } from "lucide-react-native"
import { useRouter } from "expo-router"
import HeaderWithSidebar from "components/HeaderWithSidebar"
import { useState } from "react"

export default function HospitalsPage() {
  const router = useRouter()
  const [searchQuery, setSearchQuery] = useState("")

  const hospitals = [
    {
      id: 1,
      name: "Central Medical Center",
      type: "General Hospital",
      rating: 4.6,
      reviews: 342,
      phone: "(555) 123-4567",
      emergencyPhone: "(555) 123-9999",
      address: "1200 Medical Plaza, Downtown",
      hours: "24/7 Emergency Services",
      specialties: ["Emergency Care", "Cardiology", "Surgery", "Maternity"],
      hasER: true,
      waitTime: "15-30 minutes",
    },
    {
      id: 2,
      name: "St. Mary's Hospital",
      type: "Catholic Hospital",
      rating: 4.8,
      reviews: 278,
      phone: "(555) 234-5678",
      emergencyPhone: "(555) 234-9999",
      address: "456 Saint Mary Drive, Westside",
      hours: "24/7 Emergency Services",
      specialties: ["Oncology", "Neurology", "Pediatrics", "Rehabilitation"],
      hasER: true,
      waitTime: "20-35 minutes",
    },
    {
      id: 3,
      name: "Community Health Clinic",
      type: "Outpatient Clinic",
      rating: 4.4,
      reviews: 156,
      phone: "(555) 345-6789",
      emergencyPhone: null,
      address: "789 Community Way, Northside",
      hours: "Mon-Fri 7AM-7PM, Sat 8AM-4PM",
      specialties: ["Primary Care", "Urgent Care", "Preventive Medicine", "Mental Health"],
      hasER: false,
      waitTime: "10-25 minutes",
    },
    {
      id: 4,
      name: "Regional Trauma Center",
      type: "Trauma Hospital",
      rating: 4.7,
      reviews: 198,
      phone: "(555) 456-7890",
      emergencyPhone: "(555) 456-9999",
      address: "321 Emergency Blvd, Eastside",
      hours: "24/7 Emergency & Trauma Services",
      specialties: ["Trauma Surgery", "Emergency Medicine", "Critical Care", "Burn Unit"],
      hasER: true,
      waitTime: "5-15 minutes",
    },
    {
      id: 5,
      name: "Children's Medical Center",
      type: "Pediatric Hospital",
      rating: 4.9,
      reviews: 421,
      phone: "(555) 567-8901",
      emergencyPhone: "(555) 567-9999",
      address: "654 Kids Health Ave, Southside",
      hours: "24/7 Pediatric Emergency Services",
      specialties: ["Pediatric Emergency", "NICU", "Pediatric Surgery", "Child Psychology"],
      hasER: true,
      waitTime: "12-25 minutes",
    },
  ]

  const filteredHospitals = hospitals.filter(
    (hospital) =>
      hospital.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      hospital.type.toLowerCase().includes(searchQuery.toLowerCase()) ||
      hospital.specialties.some((specialty) => specialty.toLowerCase().includes(searchQuery.toLowerCase())),
  )

  const handleCall = (phoneNumber: string) => {
    Linking.openURL(`tel:${phoneNumber}`)
  }

  const handleEmergencyCall = (phoneNumber: string) => {
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
    <View className="flex-1 bg-gradient-to-br from-blue-50 to-indigo-50">
      <StatusBar barStyle="dark-content" backgroundColor="#EFF6FF" />

      <HeaderWithSidebar title="Medical Facilities" showBackButton={false} />

      {/* Search Section */}
      <View className="mx-4 mt-4">
        <View className="flex-row items-center rounded-2xl bg-white px-4 py-3 shadow-sm">
          <Search size={20} color="#6B7280" />
          <TextInput
            placeholder="Search facilities or specialties"
            value={searchQuery}
            onChangeText={setSearchQuery}
            className="ml-3 flex-1 text-base text-gray-900"
            placeholderTextColor="#9CA3AF"
          />
        </View>
      </View>

      <ScrollView className="flex-1 px-4" showsVerticalScrollIndicator={false}>
        <View className="py-6">
          {/* Hospital List */}
          <View className="space-y-6">
            {filteredHospitals.map((hospital) => (
              <View key={hospital.id} className="rounded-3xl bg-white shadow-lg">
                {/* Header */}
                <View className="p-6">
                  <View className="flex-row items-start justify-between">
                    <View className="flex-1">
                      <Text className="text-xl font-bold text-gray-900">{hospital.name}</Text>
                      <Text className="mt-1 text-base text-indigo-600 font-medium">{hospital.type}</Text>
                    </View>
                    <View className="ml-4 flex-row" style={{gap: 8}}>
                      {hospital.hasER && (
                        <View className="rounded-full bg-red-100 px-3 py-1">
                          <Text className="text-xs font-bold text-red-700">ER</Text>
                        </View>
                      )}
                      <View className="rounded-full bg-blue-100 px-3 py-1">
                        <Text className="text-xs font-medium text-blue-700">{hospital.waitTime}</Text>
                      </View>
                    </View>
                  </View>

                  {/* Rating */}
                  <View className="mt-3 flex-row items-center">
                    <View className="mr-2 flex-row">{renderRating(hospital.rating)}</View>
                    <Text className="text-sm font-semibold text-gray-700">{hospital.rating}</Text>
                    <Text className="ml-1 text-sm text-gray-500">({hospital.reviews} reviews)</Text>
                  </View>
                </View>

                {/* Content */}
                <View className="px-6 pb-6">
                  {/* Specialties */}
                  <View className="mb-6">
                    <Text className="mb-3 text-base font-semibold text-gray-900">Medical Specialties</Text>
                    <View className="flex-row flex-wrap gap-2">
                      {hospital.specialties.map((specialty, index) => (
                        <View
                          key={index}
                          className="rounded-full bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 px-4 py-2"
                        >
                          <Text className="text-sm font-medium text-blue-700">{specialty}</Text>
                        </View>
                      ))}
                    </View>
                  </View>

                  {/* Contact Information */}
                  <View style={{gap: 12}}>
                    <View className="flex-row items-center">
                      <View className="rounded-full bg-gray-100 p-2">
                        <Phone size={16} color="#6B7280" />
                      </View>
                      <Text className="ml-3 text-gray-700">{hospital.phone}</Text>
                    </View>
                    {hospital.emergencyPhone && (
                      <View className="flex-row items-center">
                        <View className="rounded-full bg-red-100 p-2">
                          <Ambulance size={16} color="#DC2626" />
                        </View>
                        <Text className="ml-3 font-semibold text-red-700">Emergency: {hospital.emergencyPhone}</Text>
                      </View>
                    )}
                    <View className="flex-row items-center">
                      <View className="rounded-full bg-gray-100 p-2">
                        <MapPin size={16} color="#6B7280" />
                      </View>
                      <Text className="ml-3 text-gray-700">{hospital.address}</Text>
                    </View>
                    <View className="flex-row items-center">
                      <View className="rounded-full bg-gray-100 p-2">
                        <Clock size={16} color="#6B7280" />
                      </View>
                      <Text className="ml-3 text-gray-700">{hospital.hours}</Text>
                    </View>
                  </View>
                </View>

                {/* Actions */}
                <View className="border-t border-gray-100 p-6">
                  {hospital.emergencyPhone ? (
                    <View style={{gap: 16}}>
                      {/* Emergency Line */}
                      <TouchableOpacity
                        className="rounded-2xl bg-red-600 px-6 py-4 shadow-lg"
                        onPress={() => handleEmergencyCall(hospital.emergencyPhone!)}
                      >
                        <View className="flex-row items-center justify-center">
                          <Ambulance size={18} color="#FFFFFF" />
                          <Text className="ml-2 text-base font-bold text-white">Emergency Line</Text>
                        </View>
                      </TouchableOpacity>
                      {/* Main Actions */}
                      <View className="flex-row" style={{gap: 12}}>
                      <TouchableOpacity
                        className="flex-1 rounded-2xl bg-gray-900 px-4 py-3 shadow-sm"
                        onPress={() => handleCall(hospital.phone)}
                      >
                          <View className="flex-row items-center justify-center">
                            <Phone size={16} color="#FFFFFF" />
                            <Text className="ml-2 text-sm font-semibold text-white">Call Main</Text>
                          </View>
                        </TouchableOpacity>
                        <TouchableOpacity
                          className="flex-1 rounded-2xl border border-gray-300 bg-white px-4 py-3 shadow-sm"
                          onPress={() => handleGetDirections(hospital.address)}
                        >
                          <View className="flex-row items-center justify-center">
                            <MapPin size={16} color="#6B7280" />
                            <Text className="ml-2 text-sm font-semibold text-gray-700">Directions</Text>
                          </View>
                        </TouchableOpacity>
                      </View>
                    </View>
                  ) : (
                    <View className="flex-row" style={{gap: 12}}>
                      <TouchableOpacity
                        className="flex-1 rounded-2xl bg-gray-900 px-4 py-4 shadow-sm"
                        onPress={() => handleCall(hospital.phone)}
                      >
                        <View className="flex-row items-center justify-center">
                          <Phone size={18} color="#FFFFFF" />
                          <Text className="ml-2 text-base font-semibold text-white">Call Main</Text>
                        </View>
                      </TouchableOpacity>
                      <TouchableOpacity
                        className="flex-1 rounded-2xl border border-gray-300 bg-white px-4 py-4 shadow-sm"
                        onPress={() => handleGetDirections(hospital.address)}
                      >
                        <View className="flex-row items-center justify-center">
                          <MapPin size={18} color="#6B7280" />
                          <Text className="ml-2 text-base font-semibold text-gray-700">Directions</Text>
                        </View>
                      </TouchableOpacity>
                    </View>
                  )}
                </View>
              </View>
            ))}
          </View>

          {/* Additional Resources */}
          <View className="mt-8 rounded-3xl bg-white shadow-lg">
            <View className="border-b border-gray-100 p-6">
              <Text className="text-xl font-bold text-gray-900">Additional Medical Resources</Text>
            </View>
            <View className="p-6">
              <View style={{gap: 16}}>
                <TouchableOpacity
                  className="rounded-2xl bg-blue-50 border border-blue-200 p-4"
                  onPress={() => handleCall("211")}
                >
                  <View className="flex-row items-center justify-between">
                    <View className="flex-1">
                      <Text className="text-base font-bold text-gray-900">Health Information Hotline</Text>
                      <Text className="text-sm text-gray-600">General health information and referrals</Text>
                    </View>
                    <View className="rounded-full bg-blue-500 px-4 py-2">
                      <Text className="text-sm font-bold text-white">211</Text>
                    </View>
                  </View>
                </TouchableOpacity>
                <TouchableOpacity
                  className="rounded-2xl bg-purple-50 border border-purple-200 p-4"
                  onPress={() => handleCall("988")}
                >
                  <View className="flex-row items-center justify-between">
                    <View className="flex-1">
                      <Text className="text-base font-bold text-gray-900">Mental Health Crisis Line</Text>
                      <Text className="text-sm text-gray-600">24/7 mental health crisis support</Text>
                    </View>
                    <View className="rounded-full bg-purple-500 px-4 py-2">
                      <Text className="text-sm font-bold text-white">988</Text>
                    </View>
                  </View>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </View>
      </ScrollView>
    </View>
  )
}
