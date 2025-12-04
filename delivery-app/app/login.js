import React, { useState, useContext } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ActivityIndicator, Alert, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { AuthContext } from '../context/AuthContext';
import { Stack } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';

const LoginScreen = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const { login, isLoading } = useContext(AuthContext);

    const handleLogin = async () => {
        if (!email || !password) {
            Alert.alert('Error', 'Por favor ingrese correo y contraseña');
            return;
        }

        const result = await login(email, password);
        if (!result.success) {
            Alert.alert('Error de inicio de sesión', result.message);
        }
    };

    return (
        <View style={styles.mainContainer}>
            <StatusBar style="dark" translucent={true} backgroundColor="transparent" />
            <Stack.Screen options={{ headerShown: false }} />

            {/* Top Section - Brand */}
            <View style={styles.topSection}>
                <View style={styles.brandContainer}>
                    <Text style={styles.welcomeText}>Bienvenido!</Text>
                    <View style={styles.logoRow}>
                        <Text style={styles.brandTitle}>Gelato</Text>
                    </View>
                </View>
            </View>

            {/* Bottom Section - Form */}
            <View style={styles.bottomSection}>
                <KeyboardAvoidingView
                    behavior={Platform.OS === 'ios' ? 'padding' : 'padding'}
                    style={styles.keyboardView}
                    keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 150}
                >
                    <ScrollView
                        contentContainerStyle={styles.scrollContent}
                        showsVerticalScrollIndicator={false}
                        keyboardShouldPersistTaps="handled"
                    >
                        <Text style={styles.loginTitle}>Login</Text>

                        <View style={styles.form}>
                            <View style={styles.inputGroup}>
                                <Text style={styles.label}>Email</Text>
                                <TextInput
                                    style={styles.input}
                                    placeholder="ejemplo@correo.com"
                                    placeholderTextColor="#9ca3af"
                                    value={email}
                                    onChangeText={setEmail}
                                    autoCapitalize="none"
                                    keyboardType="email-address"
                                />
                            </View>

                            <View style={styles.inputGroup}>
                                <Text style={styles.label}>Contraseña</Text>
                                <View style={styles.passwordContainer}>
                                    <TextInput
                                        style={[styles.input, styles.passwordInput]}
                                        placeholder="Contraseña"
                                        placeholderTextColor="#9ca3af"
                                        value={password}
                                        onChangeText={setPassword}
                                        secureTextEntry={!showPassword}
                                    />
                                    <TouchableOpacity
                                        onPress={() => setShowPassword(!showPassword)}
                                        style={styles.eyeIcon}
                                    >
                                        <Ionicons
                                            name={showPassword ? "eye-off-outline" : "eye-outline"}
                                            size={24}
                                            color="#6b7280"
                                        />
                                    </TouchableOpacity>
                                </View>
                            </View>

                            <TouchableOpacity
                                style={styles.button}
                                onPress={handleLogin}
                                disabled={isLoading}
                            >
                                {isLoading ? (
                                    <ActivityIndicator color="#fff" />
                                ) : (
                                    <Text style={styles.buttonText}>Iniciar Sesión</Text>
                                )}
                            </TouchableOpacity>
                        </View>
                    </ScrollView>
                </KeyboardAvoidingView>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    mainContainer: {
        flex: 1,
        backgroundColor: '#F3F0E7', // Beige background for top
    },
    topSection: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        height: 320,
        backgroundColor: '#F3F0E7',
        justifyContent: 'flex-start',
        paddingHorizontal: 30,
        paddingTop: 80,
        zIndex: 1,
    },
    safeAreaTop: {
        flex: 1,
        justifyContent: 'center',
    },
    brandContainer: {
        marginTop: 20,
    },
    welcomeText: {
        fontSize: 24,
        fontWeight: '500',
        color: '#000',
        marginBottom: 5,
    },
    logoRow: {
        flexDirection: 'row',
        alignItems: 'baseline',
    },
    brandTitle: {
        fontSize: 60,
        fontWeight: '900',
        color: '#000',
        letterSpacing: -2,
    },
    bottomSection: {
        flex: 1,
        marginTop: 280, // 320 (header height) - 40 (overlap)
        backgroundColor: '#fff',
        borderTopLeftRadius: 40,
        borderTopRightRadius: 40,
        paddingHorizontal: 30,
        paddingTop: 40,
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: -2,
        },
        shadowOpacity: 0.1,
        shadowRadius: 10,
        elevation: 5,
    },
    keyboardView: {
        flex: 1,
    },
    scrollContent: {
        paddingBottom: 200, // Increased padding to allow scrolling up
        flexGrow: 1,
    },
    loginTitle: {
        fontSize: 28,
        fontWeight: 'bold',
        color: '#000',
        marginBottom: 30,
    },
    form: {
        gap: 20,
    },
    inputGroup: {
        marginBottom: 5,
    },
    label: {
        fontSize: 14,
        fontWeight: '600',
        color: '#000',
        marginBottom: 8,
    },
    input: {
        borderBottomWidth: 1,
        borderColor: '#e5e7eb',
        paddingVertical: 10,
        fontSize: 16,
        color: '#000',
    },
    passwordContainer: {
        position: 'relative',
        justifyContent: 'center',
    },
    passwordInput: {
        paddingRight: 40,
    },
    eyeIcon: {
        position: 'absolute',
        right: 0,
        bottom: 10,
    },
    button: {
        backgroundColor: '#000',
        paddingVertical: 16,
        borderRadius: 12,
        alignItems: 'center',
        marginTop: 10,
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    buttonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
    },
});

export default LoginScreen;
